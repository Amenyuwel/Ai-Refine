"use client";
import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const Download = ({ uploadedImages, previewImage, settings }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // Toggle the dropdown menu visibility
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  /**
   * Downloads a single image with applied filters.
   * @param {string} imageUrl - The URL of the image to process.
   * @param {string} fileName - The name for the downloaded file.
   * @returns {Promise<Blob>} - A promise resolving to the processed image blob.
   */
  const processImageWithFilters = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Prevents CORS issues
      img.src = imageUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");

        // Construct the filter string based on user settings
        ctx.filter = `
          grayscale(${settings.grayscale.value}%)
          blur(${settings.blur.enabled ? `${settings.blur.value}px` : "0px"})
          brightness(${settings.brightness.enabled ? `${settings.brightness.value}%` : "100%"})
        `;

        // Apply horizontal flip if enabled
        if (settings.flip.enabled && settings.flip.value === -1) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        // Draw the processed image onto the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert canvas to a Blob and resolve
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to convert image to blob"));
        }, "image/png");
      };

      img.onerror = (error) => reject(error);
    });
  };

  // Downloads only the preview image
  const handleDownloadPreview = () => {
    if (!previewImage) return;
    processImageWithFilters(previewImage)
      .then((blob) => saveAs(blob, "preview.png"))
      .catch((error) => console.error("Error processing preview image:", error));
    setDropdownOpen(false);
  };

  // Downloads all images as a ZIP file
  const handleDownloadAsZip = async () => {
    if (!uploadedImages?.length) return;

    const zip = new JSZip();
    const uniqueImages = Array.from(new Set(uploadedImages));

    const promises = uniqueImages.map((image, index) =>
      processImageWithFilters(image).then((blob) => {
        zip.file(`image_${index + 1}.png`, blob);
      })
    );

    try {
      await Promise.all(promises);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "images.zip");
    } catch (error) {
      console.error("Error creating ZIP file:", error);
    }

    setDropdownOpen(false);
  };

  return (
    <main className="relative">
      <button
        className="mt-4 cursor-pointer rounded-full bg-[#008CFF] px-6 py-2 text-white transition-all duration-300 hover:scale-105 hover:brightness-110"
        style={{ width: "200px", height: "50px" }}
        onClick={toggleDropdown}
      >
        DOWNLOAD
      </button>
      {isDropdownOpen && (
        <div className="absolute left-0 z-10 mt-2 w-[200px] overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg">
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-200"
            onClick={handleDownloadPreview}
          >
            DOWNLOAD PREVIEW
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-200"
            onClick={handleDownloadAsZip}
          >
            DOWNLOAD AS ZIP
          </button>
        </div>
      )}
    </main>
  );
};

export default Download;
