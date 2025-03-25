"use client";
import { FaPlus, FaTrash } from "react-icons/fa";
import React, { useRef, useState, useEffect } from "react";

const ImageFooter = ({ images = [], setImages, onImageClick }) => {
  const [selectedImage, setSelectedImage] = useState(images[0] || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!selectedImage && images.length > 0) {
      requestAnimationFrame(() => {
        const lastImage = images[images.length - 1]; // Select the last added image
        setSelectedImage(lastImage);
        onImageClick(lastImage);
      });
    }
  }, [images, selectedImage, onImageClick]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newImage = URL.createObjectURL(file);
      setImages((prevImages) => {
        const updatedImages = [...prevImages, newImage];
        setSelectedImage(newImage);
        onImageClick(newImage);
        return updatedImages;
      });
    }
  };

  const handleDeleteImage = () => {
    if (!selectedImage) return;

    setImages((prevImages) => {
      const index = prevImages.indexOf(selectedImage);
      if (index === -1) return prevImages;

      const updatedImages = prevImages.filter((img) => img !== selectedImage);

      // Select the previous image, or next image if first is deleted
      let newSelectedImage =
        updatedImages.length > 0
          ? index > 0
            ? updatedImages[index - 1]
            : updatedImages[0]
          : null;

      setSelectedImage(newSelectedImage);
      onImageClick(newSelectedImage);

      return updatedImages;
    });
  };

  return (
    <main className="bg-main flex w-full items-center gap-4 p-2">
      {/* ADD IMAGE BUTTON */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="mb-7 ml-4 flex h-24 w-24 min-w-[6rem] cursor-pointer items-center justify-center rounded-lg bg-[#87CEFA] transition hover:bg-[#6cb4eb]"
      >
        <FaPlus className="text-3xl text-[#008cff]" />
      </button>

      {/* Image List with Custom Scrollbar */}
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
              onClick={() => {
                setSelectedImage(image);
                onImageClick(image);
              }}
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
        className="bg-main left-2 mb-6 flex h-24 w-28 cursor-pointer items-center justify-center border-l-4 border-[#808080] transition hover:bg-gray-200"
        onClick={handleDeleteImage}
      >
        <FaTrash className="h-16 w-8 text-red-500" />
      </div>
    </main>
  );
};

export default ImageFooter;
