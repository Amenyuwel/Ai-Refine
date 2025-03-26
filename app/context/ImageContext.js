"use client";
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Add a new image to the list
  const addImage = useCallback((newImage) => {
    setUploadedImages((prevImages) => {
      if (prevImages.includes(newImage)) {
        return prevImages; // Avoid duplicates
      }
      return [...prevImages, newImage];
    });
  }, []);

  // Remove an image from the list
  const removeImage = useCallback((imageToRemove) => {
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
  }, []);

  // Set the selected image
  const setSelected = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      uploadedImages,
      selectedImage,
      addImage,
      removeImage,
      setSelected,
    }),
    [uploadedImages, selectedImage, addImage, removeImage, setSelected],
  );

  return (
    <ImageContext.Provider value={contextValue}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImageContext must be used within an ImageProvider");
  }
  return context;
};
