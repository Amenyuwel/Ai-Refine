"use client";
import React from "react";

const ImageFooter = ({ images }) => {
  return (
    <div className="bg-gray-200 p-4">
      <h3 className="text-lg font-bold">Other Images</h3>
      <div className="flex overflow-x-auto">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Uploaded Image ${index + 1}`}
            className="max-w-[150px] max-h-[150px] object-cover rounded-lg shadow-md mx-2"
          />
        ))}
      </div>
    </div>
  );
};

export default ImageFooter;

