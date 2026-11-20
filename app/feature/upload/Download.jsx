"use client";
import React, { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import { FilterError, renderImageWithFilters } from "@/utils/canvasFilters";
import { getExportFilters } from "@/utils/filterSettings";
import {
  buildExportFileNames,
  getExportFormat,
  getZipEntryPath,
  sanitizeClassName,
} from "@/utils/exportFileNames";
import { MANIFEST_FILE_NAME, buildManifest } from "@/utils/exportManifest";
import { appVersion } from "@/utils/siteConfig";
import { greenButtonClass } from "@/feature/upload/buttonStyles";
import { useImageContext } from "@/context/ImageContext";

// ZIP entries keep each source's format; the single preview download stays PNG.
const PREVIEW_MIME_TYPE = "image/png";
const PREVIEW_EXTENSION = ".png";
// Ignored for PNG. Above the browser default so JPEG dataset images keep more
// detail for YOLO/CNN training.
const JPEG_QUALITY = 0.95;

const DOWNLOAD_ERROR = "Could not download the image. Please try again.";
const FILTER_ERROR =
  "This browser could not apply the filters, so nothing was downloaded. Try Chrome or Firefox, or turn the filters off.";
const getDownloadErrorMessage = (error) =>
  error instanceof FilterError ? FILTER_ERROR : DOWNLOAD_ERROR;

const Download = ({
  uploadedImages = [],
  previewImage,
  settings = {},
}) => {
  const { className } = useImageContext();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // State updates land after the click handler returns, so a ref blocks a fast second click.
  const isExportRunningRef = useRef(false);

  // The toggle uses aria-disabled instead of disabled so it keeps keyboard focus while exporting.
  const toggleButtonRef = useRef(null);

  const containerRef = useRef(null);

  useEffect(() => {
    if (!isDropdownOpen) return;

    // pointerdown (not click) so the first tap on a toolbar tab both closes the menu and still reaches the tab.
    const closeOnOutsidePress = (event) => {
      if (!containerRef.current?.contains(event.target)) setDropdownOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setDropdownOpen(false);
      toggleButtonRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    if (isExportRunningRef.current) return;
    setDropdownOpen((prev) => !prev);
  };

  // The clicked menu item unmounts when the menu closes, which would drop focus to <body>.
  const closeDropdownAndFocusToggle = () => {
    setDropdownOpen(false);
    toggleButtonRef.current?.focus();
  };

  const processImageWithFilters = (imageUrl, mimeType) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.alt = "Filtered Image";

      img.onload = async () => {
        try {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          // Blur scales with the image itself, never with the screen it was previewed on.
          const filters = getExportFilters(settings, width, height);
          const canvas = await renderImageWithFilters(img, {
            width,
            height,
            ...filters,
          });

          canvas.toBlob(
            (blob) => {
              // Safari holds canvas memory until it is resized, which adds up over a 99-image ZIP.
              canvas.width = 0;
              canvas.height = 0;
              if (blob) resolve({ blob, filters });
              else reject(new Error("Failed to convert image to blob"));
            },
            mimeType,
            JPEG_QUALITY,
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = (error) => reject(error);
    });
  };

  const runExclusiveExport = async (runExport) => {
    if (isExportRunningRef.current) return;
    isExportRunningRef.current = true;
    setIsExporting(true);
    try {
      await runExport();
    } finally {
      isExportRunningRef.current = false;
      setIsExporting(false);
    }
  };

  const downloadPreview = async () => {
    try {
      const { blob } = await processImageWithFilters(
        previewImage.url,
        PREVIEW_MIME_TYPE,
      );
      saveAs(blob, `preview${PREVIEW_EXTENSION}`);
    } catch (error) {
      console.error("Error processing preview image:", error);
      toast.error(getDownloadErrorMessage(error));
    }
  };

  const handleDownloadPreview = () => {
    closeDropdownAndFocusToggle();
    if (!previewImage) return;
    return runExclusiveExport(downloadPreview);
  };

  const handleDownloadAsZip = () => {
    closeDropdownAndFocusToggle();
    if (!uploadedImages.length) return;
    return runExclusiveExport(downloadZip);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    const formats = uploadedImages.map((image) => getExportFormat(image.file));
    const exportClassName = sanitizeClassName(className);
    const zipPaths = buildExportFileNames(
      uploadedImages.map((image, index) => ({
        name: image.file.name,
        extension: formats[index].extension,
      })),
    ).map((fileName) => getZipEntryPath(exportClassName, fileName));

    try {
      // One at a time: the pixel filter path holds two full-size buffers per image.
      const failures = [];
      const manifestEntries = [];
      for (const [index, image] of uploadedImages.entries()) {
        try {
          const { blob, filters } = await processImageWithFilters(
            image.url,
            formats[index].mimeType,
          );
          zip.file(zipPaths[index], blob);
          manifestEntries.push({
            output: zipPaths[index],
            source: image.file.name,
            size: blob.size,
            sha256: image.sha256,
            filters,
          });
        } catch (error) {
          console.error("Error processing image for ZIP:", error);
          failures.push(error);
        }
      }

      if (failures.length === uploadedImages.length) {
        toast.error(
          failures[0] instanceof FilterError
            ? FILTER_ERROR
            : "Could not create the ZIP file. Please try again.",
        );
        return;
      }
      if (failures.length > 0) {
        toast.error(
          `${failures.length} of ${uploadedImages.length} images failed and are missing from the ZIP.`,
        );
      }

      zip.file(
        MANIFEST_FILE_NAME,
        buildManifest(manifestEntries, appVersion, exportClassName),
      );
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "images.zip");
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      toast.error("Could not create the ZIP file. Please try again.");
    }
  };

  return (
    <div className="relative" ref={containerRef} data-tour="download">
      <button
        className={`${greenButtonClass} flex w-full cursor-pointer items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--secondary)] aria-disabled:cursor-wait aria-disabled:opacity-60 sm:gap-2 sm:px-6`}
        ref={toggleButtonRef}
        onClick={toggleDropdown}
        aria-disabled={isExporting}
        aria-busy={isExporting}
      >
        {isExporting ? "PREPARING…" : "DOWNLOAD"}
        <ExpandCircleDownIcon
          className={`h-4 w-4 sm:h-5 sm:w-5 ${isExporting ? "animate-spin" : ""}`}
        />
      </button>
      <span role="status" className="sr-only">
        {isExporting ? "Preparing your download" : ""}
      </span>
      {isDropdownOpen && (
        <div className="absolute right-0 top-full z-[60] mt-2 flex w-[180px] flex-col items-center overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-lg sm:w-[220px]">
          <button
            className="w-full px-3 py-2 text-left text-xs hover:bg-gray-200 disabled:cursor-wait disabled:opacity-60 sm:px-4 sm:text-sm"
            onClick={handleDownloadPreview}
            disabled={isExporting}
          >
            DOWNLOAD <strong>PREVIEW</strong>
          </button>
          <button
            className="w-full px-3 py-2 text-left text-xs hover:bg-gray-200 disabled:cursor-wait disabled:opacity-60 sm:px-4 sm:text-sm"
            onClick={handleDownloadAsZip}
            disabled={isExporting}
          >
            DOWNLOAD AS <strong>ZIP FILE</strong>
          </button>
        </div>
      )}
    </div>
  );
};

export default Download;
