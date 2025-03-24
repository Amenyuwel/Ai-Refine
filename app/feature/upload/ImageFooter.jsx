"use client";
import { FaPlus } from "react-icons/fa";
import React, { useRef, useState, useEffect } from "react";

const ImageFooter = ({ images = [], setImages, onImageClick }) => {
  // Initialize selectedImage with the first image if available
  const [selectedImage, setSelectedImage] = useState(images[0] || null);
  const fileInputRef = useRef(null);

  // 🔄 Fix: Prevent updating state during rendering phase
  useEffect(() => {
    if (
      (!selectedImage || !images.includes(selectedImage)) &&
      images.length > 0
    ) {
      setTimeout(() => {
        setSelectedImage(images[0]);
        onImageClick(images[0]);
      }, 0);
    }
  }, [images, selectedImage, onImageClick]);

  // Handle Image Upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newImage = URL.createObjectURL(file);

      setImages((prevImages) => {
        const updatedImages = [...prevImages, newImage];

        // Set the newly uploaded image as both preview and selected image immediately
        onImageClick(newImage);
        setSelectedImage(newImage);

        return updatedImages;
      });
    }
  };

  return (
    <main className="bg-main p-4">
      <section className="flex space-x-4 overflow-x-auto">
        {/* ADD IMAGE BUTTON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg bg-[#87CEFA]"
        >
          <FaPlus className="text-3xl text-[#008cff]" />
        </button>

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
            onClick={() => {
              onImageClick(image);
              setSelectedImage(image);
            }}
            className={`flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg ${
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
      </section>
    </main>
  );
};

export default ImageFooter;
