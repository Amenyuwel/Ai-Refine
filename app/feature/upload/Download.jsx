"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import { FilterError, renderImageWithFilters } from "@/utils/canvasFilters";
import {
  DEFAULT_SETTINGS,
  getExportFilters,
  getMidpointSettings,
} from "@/utils/filterSettings";
import {
  getExportFormat,
  planExportFiles,
  sanitizeClassName,
} from "@/utils/exportFileNames";
import { MANIFEST_FILE_NAME, buildManifest } from "@/utils/exportManifest";
import {
  estimateExport,
  getExportSizeNotice,
} from "@/utils/exportSizeEstimate";
import { getFileKey } from "@/utils/fileKey";
import { sampleVariantSettings } from "@/utils/variantSampler";
import { appVersion } from "@/utils/siteConfig";
import { greenButtonClass } from "@/feature/upload/buttonStyles";
import { useImageContext } from "@/context/ImageContext";

// ZIP entries keep each source's format; the single preview download stays PNG.
const PREVIEW_MIME_TYPE = "image/png";
const PREVIEW_EXTENSION = ".png";
// Ignored for PNG. Above the browser default so JPEG dataset images keep more
// detail for YOLO/CNN training.
const JPEG_QUALITY = 0.95;

const loadImage = (imageUrl) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = imageUrl;
  });

const renderToBlob = async (img, filters, mimeType) => {
  const canvas = await renderImageWithFilters(img, {
    width: img.naturalWidth,
    height: img.naturalHeight,
    ...filters,
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // Safari holds canvas memory until it is resized, which adds up over a 99-image ZIP.
        canvas.width = 0;
        canvas.height = 0;
        if (blob) resolve(blob);
        else reject(new Error("Failed to convert image to blob"));
      },
      mimeType,
      JPEG_QUALITY,
    );
  });
};

// Used when the seed field is empty; the manifest records it so the export
// can be reproduced.
const generateSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];

const DOWNLOAD_ERROR = "Could not download the image. Please try again.";
const FILTER_ERROR =
  "This browser could not apply the filters, so nothing was downloaded. Try Chrome or Firefox, or turn the filters off.";
const getDownloadErrorMessage = (error) =>
  error instanceof FilterError ? FILTER_ERROR : DOWNLOAD_ERROR;

const Download = ({ uploadedImages = [], previewImage, settings = {} }) => {
  const { className, randomize, ranges, variantCount, seed } =
    useImageContext();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // State updates land after the click handler returns, so a ref blocks a fast second click.
  const isExportRunningRef = useRef(false);

  // The toggle uses aria-disabled instead of disabled so it keeps keyboard focus while exporting.
  const toggleButtonRef = useRef(null);

  const containerRef = useRef(null);

  const exportVariantCount = randomize ? variantCount : 0;
  const exportSizeNotice = getExportSizeNotice(
    estimateExport(
      uploadedImages.map((image) => image.file.size),
      exportVariantCount,
    ),
  );
  const isZipBlocked = exportSizeNotice?.isBlocked ?? false;
  const sizeNoticeId = useId();

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

  // Which values a ZIP file is rendered with. Blur scales with the image
  // itself, never with the screen it was previewed on.
  const getFileFilters = ({ variant }, fileKey, exportSeed, img) => {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (variant > 0) {
      return sampleVariantSettings(
        ranges,
        exportSeed,
        fileKey,
        variant,
        width,
        height,
      );
    }
    // With randomize on, variant 0 is the untouched original.
    if (randomize) {
      return getExportFilters(DEFAULT_SETTINGS, width, height);
    }
    return getExportFilters(settings, width, height);
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
      const img = await loadImage(previewImage.url);
      // WYSIWYG: with randomize on, the preview shows range midpoints.
      const previewSettings = randomize
        ? getMidpointSettings(settings, ranges)
        : settings;
      const filters = getExportFilters(
        previewSettings,
        img.naturalWidth,
        img.naturalHeight,
      );
      const blob = await renderToBlob(img, filters, PREVIEW_MIME_TYPE);
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
    if (!uploadedImages.length || isZipBlocked) return;
    return runExclusiveExport(downloadZip);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    const formats = uploadedImages.map((image) => getExportFormat(image.file));
    const fileKeys = uploadedImages.map((image) =>
      getFileKey(image.file, image.sha256),
    );
    const exportClassName = sanitizeClassName(className);
    const exportSeed = randomize ? (seed ?? generateSeed()) : null;
    const exportPlan = planExportFiles(
      uploadedImages.map((image, index) => ({
        name: image.file.name,
        extension: formats[index].extension,
      })),
      exportClassName,
      exportVariantCount,
    );
    const totalFileCount = exportPlan.flat().length;

    try {
      // One at a time: the pixel filter path holds two full-size buffers per image.
      const failures = [];
      const manifestEntries = [];
      for (const [index, image] of uploadedImages.entries()) {
        const exportFiles = exportPlan[index];
        let img;
        try {
          img = await loadImage(image.url);
        } catch (error) {
          console.error("Error loading image for ZIP:", error);
          failures.push(...exportFiles.map(() => error));
          continue;
        }
        for (const exportFile of exportFiles) {
          try {
            const filters = getFileFilters(
              exportFile,
              fileKeys[index],
              exportSeed,
              img,
            );
            const blob = await renderToBlob(
              img,
              filters,
              formats[index].mimeType,
            );
            zip.file(exportFile.path, blob);
            manifestEntries.push({
              output: exportFile.path,
              source: image.file.name,
              size: blob.size,
              sha256: image.sha256,
              variant: exportFile.variant,
              filters,
            });
          } catch (error) {
            console.error("Error processing image for ZIP:", error);
            failures.push(error);
          }
        }
      }

      if (failures.length === totalFileCount) {
        toast.error(
          failures[0] instanceof FilterError
            ? FILTER_ERROR
            : "Could not create the ZIP file. Please try again.",
        );
        return;
      }
      if (failures.length > 0) {
        toast.error(
          `${failures.length} of ${totalFileCount} images failed and are missing from the ZIP.`,
        );
      }

      zip.file(
        MANIFEST_FILE_NAME,
        buildManifest(
          manifestEntries,
          appVersion,
          exportClassName,
          randomize
            ? { seed: exportSeed, variantCount: exportVariantCount }
            : null,
        ),
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
        <div className="absolute top-full right-0 z-[60] mt-2 flex w-[180px] flex-col items-center overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-lg sm:w-[220px]">
          <button
            className="w-full px-3 py-2 text-left text-xs hover:bg-gray-200 disabled:cursor-wait disabled:opacity-60 sm:px-4 sm:text-sm"
            onClick={handleDownloadPreview}
            disabled={isExporting}
          >
            DOWNLOAD <strong>PREVIEW</strong>
          </button>
          {/* aria-disabled, not disabled, when over the cap, so keyboard
              users can still reach the button and hear why it is off. */}
          <button
            className="w-full px-3 py-2 text-left text-xs hover:bg-gray-200 disabled:cursor-wait disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-transparent sm:px-4 sm:text-sm"
            onClick={handleDownloadAsZip}
            disabled={isExporting}
            aria-disabled={isZipBlocked}
            aria-describedby={exportSizeNotice ? sizeNoticeId : undefined}
          >
            DOWNLOAD AS <strong>ZIP FILE</strong>
          </button>
          {exportSizeNotice && (
            <p
              id={sizeNoticeId}
              className={`w-full px-3 pb-2 text-left text-xs sm:px-4 ${isZipBlocked ? "text-red-700" : "text-amber-800"}`}
            >
              {exportSizeNotice.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Download;
