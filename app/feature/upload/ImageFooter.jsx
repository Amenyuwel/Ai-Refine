"use client";
import React, { useRef, useCallback } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useImageContext } from "../../context/ImageContext";

const ImageFooter = ({ onImageClick, onImageDelete }) => {
  const {
    uploadedImages: images,
    selectedImage,
    addImage,
    removeImage,
    setSelected,
  } = useImageContext();

  const fileInputRef = useRef(null);

  const handleImageClick = useCallback(
    (image) => {
      setSelected(image);
      if (onImageClick) {
        onImageClick(image);
      }
    },
    [onImageClick, setSelected],
  );

  const handleImageUpload = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (file) {
        const newImage = URL.createObjectURL(file);
        addImage(newImage);
        setSelected(newImage);
        if (onImageClick) {
          onImageClick(newImage);
        }

        // Cleanup the object URL to prevent memory leaks
        setTimeout(() => URL.revokeObjectURL(newImage), 5000);
      }
    },
    [addImage, onImageClick, setSelected],
  );

  const handleDeleteImage = useCallback(() => {
    if (!selectedImage) return;

    removeImage(selectedImage);
    if (onImageDelete) {
      onImageDelete(selectedImage);
    }
  }, [selectedImage, removeImage, onImageDelete]);

  return (
    <main className="bg-main flex w-full items-center gap-4 p-2">
      {/* ADD IMAGE BUTTON */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="mb-7 ml-4 flex h-24 w-24 min-w-[6rem] cursor-pointer items-center justify-center rounded-lg bg-[#87CEFA] transition hover:bg-[#6cb4eb]"
      >
        <FaPlus className="text-3xl text-[#008cff]" />
      </button>

      {/* Image List */}
      <section className="relative w-full overflow-hidden">
        <div className="scrollbar scrollbar-thumb-[#008cff] scrollbar-track-gray-200 flex space-x-4 overflow-x-auto pb-4">
          {/* Hidden Input for File Upload */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {/* Render Footer Images */}
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => handleImageClick(image)}
              className={`flex h-24 w-24 min-w-[6rem] cursor-pointer items-center justify-center rounded-lg transition ${
                selectedImage === image ? "border-2 border-[#009CFF]" : ""
              }`}
            >
              <img
                src={image}
                alt={`Uploaded Image ${index + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* DELETE BUTTON */}
      <div
        className="bg-main left-2 mb-6 flex h-24 w-28 cursor-pointer items-center justify-center border-l-4 border-[#d3d3d3] transition hover:bg-gray-200"
        onClick={handleDeleteImage}
      >
        <FaTrash className="h-16 w-8 text-red-500" />
      </div>
    </main>
  );
};

export default ImageFooter;
