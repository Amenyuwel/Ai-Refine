"use client";
import { FaPlus } from "react-icons/fa";
import React, { useRef, useState } from "react";

const ImageFooter = ({ images = [], setImages, onImageClick }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Handle Image Upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newImage = URL.createObjectURL(file);

      setImages((prevImages) => {
        const updatedImages = [...prevImages, newImage];

        // Ensure the newly uploaded image becomes the preview image
        onImageClick(newImage); // 🔥 Set preview image immediately

        return updatedImages;
      });
    }
  };

  return (
    <main className="bg-main p-4">
      <section className="flex overflow-x-auto space-x-4">
        {/* ADD IMAGE BUTTON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="h-24 w-24 rounded-lg bg-[#87CEFA] flex items-center justify-center cursor-pointer"
        >
          <FaPlus className="text-[#008cff] text-3xl" />
        </button>

        {/* Hidden Input for File Upload */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />

        {/* Show Uploaded Images */}
        {images.map((image, index) => (
          <div
            onClick={() => {
              onImageClick(image);
              setSelectedImage(image);
            }}
            key={index}
            className={`h-24 w-24 rounded-lg flex items-center justify-center cursor-pointer ${
              selectedImage === image ? "border-2 border-[#009CFF]" : ""
            }`}
          >
            <img
              src={image}
              alt={`Uploaded Image ${index + 1}`}
              className="h-full w-full object-cover rounded-lg"
            />
          </div>
        ))}
      </section>
    </main>
  );
};

export default ImageFooter;
