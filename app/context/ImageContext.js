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
import { getFileKey } from "@/utils/fileKey";

// Matches maxSelect on uploaded_images.images in PocketBase
export const MAX_IMAGES = 99;
const LIMIT_WARNING = `You have reached the maximum limit of ${MAX_IMAGES} images.`;
const DUPLICATE_NOTICE = "Skipped images that are already in the list.";
const READ_ERROR = "Could not read the images. Please try again.";

const ImageContext = createContext();

// One at a time: hashing reads each file fully into memory.
const readFileKeys = async (files) => {
  const fileKeys = [];
  for (const file of files) fileKeys.push(await getFileKey(file));
  return fileKeys;
};

export const ImageProvider = ({ children }) => {
  // Each image is { id, file, url }: id is the content key, url a blob URL.
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Mirrors the list synchronously so addFiles can decide on the warning
  // outside the state updater (React may run updaters twice).
  const uploadedImagesRef = useRef(uploadedImages);

  // Add image files to the list. One call is one user attempt: pass every file
  // of a drop in a single call so each notice shows once. Files whose content
  // is already listed are skipped. Returns the images that were added.
  const addFiles = useCallback(async (files) => {
    let fileKeys;
    try {
      fileKeys = await readFileKeys(files);
    } catch (error) {
      console.error("Error reading image files:", error);
      toast.error(READ_ERROR);
      return [];
    }

    // Read the list after hashing: another drop may have landed meanwhile.
    const currentImages = uploadedImagesRef.current;
    const listedIds = new Set(currentImages.map((image) => image.id));
    const uniqueFilesById = new Map();
    files.forEach((file, index) => {
      const id = fileKeys[index];
      if (!listedIds.has(id) && !uniqueFilesById.has(id)) {
        uniqueFilesById.set(id, file);
      }
    });

    if (uniqueFilesById.size < files.length) {
      toast.info(DUPLICATE_NOTICE);
    }
    const addedImages = Array.from(uniqueFilesById)
      .slice(0, MAX_IMAGES - currentImages.length)
      .map(([id, file]) => ({ id, file, url: URL.createObjectURL(file) }));

    if (addedImages.length < uniqueFilesById.size) {
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
    URL.revokeObjectURL(imageToRemove.url);
  }, []);

  // Set the selected image
  const setSelected = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  // Revoke remaining Object URLs only on unmount. Running this on every list
  // change would revoke URLs of images that are still displayed.
  useEffect(() => {
    return () => {
      uploadedImagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      uploadedImages,
      selectedImage,
      addFiles,
      removeImage,
      setSelected,
    }),
    [uploadedImages, selectedImage, addFiles, removeImage, setSelected],
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
