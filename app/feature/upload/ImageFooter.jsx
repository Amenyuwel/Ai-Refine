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

const ImageFooter = ({ onImageClick, onImageDelete }) => {
  const {
    uploadedImages: images,
    selectedImage,
    addImage,
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
    (event) => {
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

      const newImages = validFiles.map((file) => URL.createObjectURL(file));
      // addImage shows the limit warning once and returns only what fit
      const addedImages = addImage(newImages);
      newImages
        .filter((image) => !addedImages.includes(image))
        .forEach((image) => URL.revokeObjectURL(image));
      if (addedImages.length === 0) return;

      setSelected(addedImages[0]);
      onImageClick?.(addedImages[0]);
    },
    [addImage, onImageClick, setSelected],
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
    <div className="bg-main flex w-full items-center gap-2 sm:gap-4 p-2">
      {/* Add Image Button */}
      <button
        type="button"
        aria-label="Add image"
        onClick={() => fileInputRef.current?.click()}
        className="m-1 sm:m-2 mb-2 ml-2 sm:ml-4 flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 min-w-[4rem] sm:min-w-[5rem] md:min-w-[6rem] cursor-pointer items-center justify-center rounded-lg bg-[#87CEFA] transition hover:bg-[#6cb4eb]"
      >
        <FaPlus aria-hidden="true" className="text-xl sm:text-2xl md:text-3xl text-[#008cff]" />
      </button>

      {/* Image List */}
      <section className="relative w-full overflow-hidden">
        <div className="scrollbar flex space-x-2 sm:space-x-4 overflow-x-auto">
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
              key={index}
              aria-pressed={selectedImage === image}
              onClick={() => handleImageClick(image)}
              onFocus={revealThumbnail}
              className={`flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 min-w-[4rem] sm:min-w-[5rem] md:min-w-[6rem] cursor-pointer items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--secondary)] ${
                selectedImage === image ? "border-2 border-[#009CFF]" : ""
              }`}
            >
              {/* thumbnails are user-uploaded blob/data URLs the optimizer cannot fetch */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
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
        className="bg-main left-2 mb-6 flex h-16 w-20 sm:h-20 sm:w-24 md:h-24 md:w-28 cursor-pointer items-center justify-center border-l-2 sm:border-l-4 border-[#d3d3d3] transition hover:bg-gray-200"
        onClick={handleDeleteImage}
      >
        <FaTrash
          aria-hidden="true"
          className="h-8 w-6 sm:h-12 sm:w-6 md:h-16 md:w-8 text-red-500"
        />
      </button>
    </div>
  );
};

export default ImageFooter;
