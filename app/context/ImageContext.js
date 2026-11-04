"use client";
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MAX_IMAGES = 100;
const LIMIT_WARNING = "You have reached the maximum limit of 100 images.";

const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Mirrors the list synchronously so addImage can decide on the warning
  // outside the state updater (React may run updaters twice).
  const uploadedImagesRef = useRef(uploadedImages);

  // Add images to the list. One call is one user attempt: pass every file of a
  // drop in a single call so the limit warning shows once. Returns the images
  // that were added so the caller can revoke the ones that were left out.
  const addImage = useCallback((newImages) => {
    const currentImages = uploadedImagesRef.current;
    const newImagesArray = Array.isArray(newImages) ? newImages : [newImages];
    const uniqueImages = newImagesArray.filter(
      (img) => !currentImages.includes(img),
    );
    const addedImages = uniqueImages.slice(
      0,
      MAX_IMAGES - currentImages.length,
    );

    if (addedImages.length < uniqueImages.length) {
      toast.warning(LIMIT_WARNING);
    }
    if (addedImages.length === 0) return addedImages;

    uploadedImagesRef.current = [...currentImages, ...addedImages];
    setUploadedImages(uploadedImagesRef.current);
    return addedImages;
  }, []);

  // Remove an image from the list
  const removeImage = useCallback((imageToRemove) => {
    uploadedImagesRef.current = uploadedImagesRef.current.filter(
      (img) => img !== imageToRemove,
    );
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

  // Revoke remaining Object URLs only on unmount. Running this on every list
  // change would revoke URLs of images that are still displayed.
  useEffect(() => {
    return () => {
      uploadedImagesRef.current.forEach((img) => URL.revokeObjectURL(img));
    };
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
