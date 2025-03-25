"use client";
import React, { createContext, useState, useContext, useCallback } from "react";

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const addImage = useCallback((newImage) => {
    setUploadedImages((prevImages) => {
      if (prevImages.some((img) => img === newImage)) {
        return prevImages;
      }
      return [...prevImages, newImage];
    });
  }, []);

  const removeImage = useCallback(
    (imageToRemove) => {
      setUploadedImages((prevImages) =>
        prevImages.filter((img) => img !== imageToRemove),
      );

      setSelectedImage((prevSelected) => {
        if (prevSelected === imageToRemove) {
          const currentIndex = uploadedImages.indexOf(imageToRemove);
          const nextImage =
            uploadedImages[currentIndex + 1] ||
            uploadedImages[currentIndex - 1] ||
            null;
          return nextImage;
        }
        return prevSelected;
      });
    },
    [uploadedImages],
  );

  const setSelected = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  return (
    <ImageContext.Provider
      value={{
        uploadedImages,
        selectedImage,
        addImage,
        removeImage,
        setSelected,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => {
  return useContext(ImageContext);
};
