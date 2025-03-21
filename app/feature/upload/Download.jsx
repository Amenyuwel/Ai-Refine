"use client";
import React, { useState } from "react";

const Download = ({ uploadedImages, previewImage, settings }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // Toggle the dropdown menu visibility
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  /**
   * Downloads a single image with applied filters.
   * @param {string} imageUrl - The URL of the image to process.
   * @param {string} fileName - The name for the downloaded file.
   */
  const downloadImageWithFilters = (imageUrl, fileName) => {
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

      // Convert canvas to a downloadable image
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    img.onerror = (error) =>
      console.error("Error loading image for download:", error);
  };

  // Downloads only the preview image
  const handleDownloadPreview = () => {
    if (!previewImage) return;
    downloadImageWithFilters(previewImage, "preview.png");
    setDropdownOpen(false);
  };

  // Downloads all images, deduplicating the list to avoid duplicate downloads
  const handleDownloadAll = () => {
    if (!uploadedImages?.length) return;

    // Create a deduplicated array of images
    const uniqueImages = Array.from(new Set(uploadedImages));
    uniqueImages.forEach((image, index) =>
      downloadImageWithFilters(image, `image_${index + 1}.png`)
    );
    setDropdownOpen(false);
  };

  return (
    <main className="relative">
      <button
        className="cursor-pointer mt-4 px-6 py-2 rounded-full bg-[#008CFF] hover:brightness-110 text-white transition-all hover:scale-105 duration-300"
        style={{ width: "200px", height: "50px" }}
        onClick={toggleDropdown}
      >
        DOWNLOAD
      </button>
      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-[200px] bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300 z-10">
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-200"
            onClick={handleDownloadPreview}
          >
            DOWNLOAD PREVIEW
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-200"
            onClick={handleDownloadAll}
          >
            DOWNLOAD ALL
          </button>
        </div>
      )}
    </main>
  );
};

export default Download;
