"use client";
import React, { useRef, useCallback } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useImageContext } from "../../context/ImageContext";
import {
  ACCEPTED_IMAGE_INPUT_ACCEPT,
  INVALID_IMAGE_FORMAT_MESSAGE,
  isAcceptedImageFile,
} from "@/utils/imageTypes";
import { addButtonClass, deleteButtonClass } from "@/feature/upload/buttonStyles";

// Thumbnails and the add and delete buttons share one square size.
const tileSizeClass =
  "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 min-w-[4rem] sm:min-w-[5rem] md:min-w-[6rem]";

const ImageFooter = ({ onImageClick, onImageDelete }) => {
  const {
    uploadedImages: images,
    selectedImage,
    addFiles,
    removeImage,
    setSelected,
  } = useImageContext();

  const fileInputRef = useRef(null);

  // Handle image selection
  const handleImageClick = useCallback(
    (image) => {
      setSelected(image);
      onImageClick?.(image);
    },
    [onImageClick, setSelected],
  );

  // Chromium skips its own scroll when a few pixels of the thumbnail already show
  const revealThumbnail = (event) => {
    event.currentTarget.scrollIntoView({ inline: "nearest", block: "nearest" });
  };

  // Handle image upload
  const handleImageUpload = useCallback(
    async (event) => {
      const input = event.target;
      const files = Array.from(input.files);
      // Reset so picking the same file again still fires onChange
      input.value = "";
      if (files.length === 0) return;

      const validFiles = files.filter(isAcceptedImageFile);
      if (validFiles.length < files.length) {
        toast.error(INVALID_IMAGE_FORMAT_MESSAGE);
      }
      if (validFiles.length === 0) return;

      // addFiles shows the duplicate and limit notices and returns only what was added
      const addedImages = await addFiles(validFiles);
      if (addedImages.length === 0) return;

      setSelected(addedImages[0]);
      onImageClick?.(addedImages[0]);
    },
    [addFiles, onImageClick, setSelected],
  );

  // Handle image deletion
  const handleDeleteImage = useCallback(() => {
    if (!selectedImage) return;

    const currentIndex = images.indexOf(selectedImage);

    // Remove the selected image
    removeImage(selectedImage);

    // Determine the next selected image
    const nextSelectedImage =
      currentIndex > 0
        ? images[currentIndex - 1] // Prioritize the previous image
        : images[currentIndex + 1] || null; // Fallback to the next image or null

    setSelected(nextSelectedImage);
    onImageDelete?.(selectedImage);
  }, [selectedImage, images, removeImage, setSelected, onImageDelete]);

  return (
    <div data-tour="image-footer" className="bg-main flex w-full items-start gap-2 px-2 py-2 sm:gap-4 sm:px-4">
      {/* Add Image Button */}
      <button
        type="button"
        aria-label="Add image"
        title="Add image"
        onClick={() => fileInputRef.current?.click()}
        className={`${tileSizeClass} ${addButtonClass}`}
      >
        <FaPlus aria-hidden="true" className="text-xl sm:text-2xl md:text-3xl" />
      </button>

      {/* Image List */}
      <section className="relative min-w-0 flex-1 overflow-hidden">
        <div className="scrollbar flex space-x-2 overflow-x-auto pb-2 sm:space-x-4 sm:pb-3">
          {/* Hidden Input for File Upload */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            className="hidden"
            accept={ACCEPTED_IMAGE_INPUT_ACCEPT}
            onChange={handleImageUpload}
          />
          {/* Render Uploaded Images */}
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id}
              aria-pressed={selectedImage === image}
              onClick={() => handleImageClick(image)}
              onFocus={revealThumbnail}
              className={`flex ${tileSizeClass} cursor-pointer items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--secondary)] ${
                selectedImage === image ? "border-2 border-[#009CFF]" : ""
              }`}
            >
              {/* thumbnails are user-uploaded blob/data URLs the optimizer cannot fetch */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={`Uploaded Image ${index + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Delete Button */}
      <button
        type="button"
        aria-label="Delete selected image"
        title="Delete selected image"
        className={`${tileSizeClass} ${deleteButtonClass}`}
        onClick={handleDeleteImage}
      >
        <FaTrash
          aria-hidden="true"
          className="text-xl sm:text-2xl md:text-3xl"
        />
      </button>
    </div>
  );
};

export default ImageFooter;
