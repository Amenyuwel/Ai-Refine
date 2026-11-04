"use client";
import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDownOutlined";

const Download = ({
  uploadedImages = [],
  previewImage,
  settings = {},
  previewFrameRef,
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // The preview fits the image into its frame with object-contain, then blurs it
  // in screen pixels. Dividing by that fit scale gives the same look in natural pixels.
  const getBlurRadiusInImagePixels = (img) => {
    if (!settings?.blur?.enabled) return 0;
    const frame = previewFrameRef?.current;
    if (!frame?.clientWidth || !frame?.clientHeight) {
      throw new Error("Preview frame has no size to match the blur against");
    }
    const fitScale = Math.min(
      frame.clientWidth / img.naturalWidth,
      frame.clientHeight / img.naturalHeight,
    );
    return settings.blur.value / fitScale;
  };

  const processImageWithFilters = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.alt = "Filtered Image";

      img.onload = () => {
        let blurRadius;
        try {
          blurRadius = getBlurRadiusInImagePixels(img);
        } catch (error) {
          reject(error);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");

        ctx.filter = `
          grayscale(${settings?.grayscale?.enabled ? settings.grayscale.value : 0}%)
          blur(${blurRadius}px)
          brightness(${settings?.brightness?.enabled ? `${settings.brightness.value}%` : "100%"})
        `;

        if (settings?.flip?.enabled && settings.flip.value === -1) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to convert image to blob"));
        }, "image/png");
      };

      img.onerror = (error) => reject(error);
    });
  };

  const handleDownloadPreview = () => {
    setDropdownOpen(false);
    if (!previewImage) return;

    processImageWithFilters(previewImage)
      .then((blob) => saveAs(blob, "preview.png"))
      .catch((error) => {
        console.error("Error processing preview image:", error);
        toast.error("Could not download the image. Please try again.");
      });
  };

  const handleDownloadAsZip = async () => {
    setDropdownOpen(false);
    if (!uploadedImages.length) return;

    const zip = new JSZip();
    const uniqueImages = Array.from(new Set(uploadedImages));

    try {
      const results = await Promise.allSettled(
        uniqueImages.map((image, index) =>
          processImageWithFilters(image).then((blob) => {
            zip.file(`image_${index + 1}.png`, blob);
          }),
        ),
      );

      const failures = results.filter((result) => result.status === "rejected");
      failures.forEach((failure) =>
        console.error("Error processing image for ZIP:", failure.reason),
      );
      if (failures.length === uniqueImages.length) {
        toast.error("Could not create the ZIP file. Please try again.");
        return;
      }
      if (failures.length > 0) {
        toast.error(
          `${failures.length} of ${uniqueImages.length} images failed and are missing from the ZIP.`,
        );
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "images.zip");
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      toast.error("Could not create the ZIP file. Please try again.");
    }
  };

  return (
    <div className="relative">
      <button
        className="bg-main w-full justify-center text-main flex cursor-pointer items-center gap-1 sm:gap-2 rounded-3xl border border-gray-500 px-4 sm:px-6 py-2 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
        onClick={toggleDropdown}
      >
        DOWNLOAD
        <ExpandCircleDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      {isDropdownOpen && (
        <div className="absolute left-1/2 z-10 mt-2 flex w-[180px] sm:w-[220px] -translate-x-1/2 flex-col items-center overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-lg">
          <button
            className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-200 text-xs sm:text-sm"
            onClick={handleDownloadPreview}
          >
            DOWNLOAD <strong>PREVIEW</strong>
          </button>
          <button
            className="w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-200 text-xs sm:text-sm"
            onClick={handleDownloadAsZip}
          >
            DOWNLOAD AS <strong>ZIP FILE</strong>
          </button>
        </div>
      )}
    </div>
  );
};

export default Download;
