"use client";
import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const Download = ({ uploadedImages = [], previewImage, settings = {} }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const processImageWithFilters = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.alt = "Filtered Image";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");

        ctx.filter = `
          grayscale(${settings?.grayscale?.value || 0}%)
          blur(${settings?.blur?.enabled ? `${settings.blur.value}px` : "0px"})
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
      .catch((error) =>
        console.error("Error processing preview image:", error),
      );
  };

  const handleDownloadAsZip = async () => {
    setDropdownOpen(false);
    if (!uploadedImages.length) return;

    const zip = new JSZip();
    const uniqueImages = Array.from(new Set(uploadedImages));

    try {
      await Promise.all(
        uniqueImages.map((image, index) =>
          processImageWithFilters(image).then((blob) => {
            zip.file(`image_${index + 1}.png`, blob);
          }),
        ),
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "images.zip");
    } catch (error) {
      console.error("Error creating ZIP file:", error);
    }
  };

  return (
    <main className="relative">
      <button
        className="bg-main text-main mt-4 cursor-pointer rounded-3xl border border-gray-500 px-6 py-2 transition-all duration-300 hover:scale-105"
        onClick={toggleDropdown}
      >
        DOWNLOAD
      </button>
      {isDropdownOpen && (
        <div className="absolute left-1/2 z-10 mt-2 flex w-[220px] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-lg items-center">
          <button
            className="px-4 py-2 text-left hover:bg-gray-200"
            onClick={handleDownloadPreview}
          >
            DOWNLOAD <strong>PREVIEW</strong>
          </button>
          <button
            className="px-4 py-2 text-left hover:bg-gray-200"
            onClick={handleDownloadAsZip}
          >
            DOWNLOAD AS <strong>ZIP FILE</strong>
          </button>
        </div>
      )}
    </main>
  );
};

export default Download;
