"use client";
import React, { useRef, useCallback, useEffect } from "react";
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
  const objectUrlRef = useRef(null); // Track the object URL

  // Handle image selection
  const handleImageClick = useCallback(
    (image) => {
      setSelected(image);
      onImageClick?.(image);
    },
    [onImageClick, setSelected],
  );

  // Handle image upload
  const handleImageUpload = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (file) {
        const newImage = URL.createObjectURL(file);
        objectUrlRef.current = newImage; // Store the object URL for cleanup later
        addImage(newImage);
        setSelected(newImage);
        onImageClick?.(newImage);
      }
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

  // Cleanup the object URL when the component unmounts
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  return (
    <main className="bg-main flex w-full items-center gap-4 p-2">
      {/* Add Image Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="m-2 mb-2 ml-4 flex h-24 w-24 min-w-[6rem] cursor-pointer items-center justify-center rounded-lg bg-[#87CEFA] transition hover:bg-[#6cb4eb]"
      >
        <FaPlus className="text-3xl text-[#008cff]" />
      </button>

      {/* Image List */}
      <section className="relative w-full overflow-hidden">
        <div className="scrollbar flex space-x-4 overflow-x-auto">
          {/* Hidden Input for File Upload */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {/* Render Uploaded Images */}
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

      {/* Delete Button */}
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
