"use client";
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [maxLimitReached, setMaxLimitReached] = useState(false);

  // Add a new image to the list (batch support)
  const addImage = useCallback((newImages) => {
    setUploadedImages((prevImages) => {
      const newImagesArray = Array.isArray(newImages) ? newImages : [newImages];
      const uniqueImages = newImagesArray.filter(
        (img) => !prevImages.includes(img),
      );

      if (prevImages.length + uniqueImages.length > 100) {
        setMaxLimitReached(true); // Mark limit reached
        return [
          ...prevImages,
          ...uniqueImages.slice(0, 100 - prevImages.length),
        ];
      }

      return [...prevImages, ...uniqueImages];
    });
  }, []);

  // Effect to show the toast when max limit is reached
  useEffect(() => {
    if (maxLimitReached) {
      toast.warning("You have reached the maximum limit of 100 images.");
    }
  }, [maxLimitReached]);

  // Remove an image from the list
  const removeImage = useCallback((imageToRemove) => {
    setUploadedImages((prevImages) => {
      const updatedImages = prevImages.filter((img) => img !== imageToRemove);

      setSelectedImage((prevSelected) => {
        if (prevSelected === imageToRemove) {
          const currentIndex = prevImages.indexOf(imageToRemove);
          return (
            updatedImages[currentIndex] ||
            updatedImages[currentIndex - 1] ||
            null
          );
        }
        return prevSelected;
      });

      return updatedImages;
    });

    // Revoke Object URL to free memory
    URL.revokeObjectURL(imageToRemove);
  }, []);

  // Set the selected image
  const setSelected = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  // Cleanup Object URLs when images are removed
  useEffect(() => {
    return () => {
      uploadedImages.forEach((img) => URL.revokeObjectURL(img));
    };
  }, [uploadedImages]);

  // Debugging - Check if uploadedImages updates
  useEffect(() => {
    console.log("Uploaded images updated:", uploadedImages);
  }, [uploadedImages]);

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
