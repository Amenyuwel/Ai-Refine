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
import { getFileKey, getFileSha256 } from "@/utils/fileKey";
import {
  DEFAULT_RANGES,
  VARIANT_COUNT_DEFAULT,
  clampVariantCount,
  syncRangeFlags,
} from "@/utils/filterSettings";

// Client-side cap on images per session
export const MAX_IMAGES = 99;
const LIMIT_WARNING = `You have reached the maximum limit of ${MAX_IMAGES} images.`;
const DUPLICATE_NOTICE = "Skipped images that are already in the list.";
const READ_ERROR = "Could not read the images. Please try again.";

const ImageContext = createContext();

// One at a time: hashing reads each file fully into memory.
const readFileHashes = async (files) => {
  const fileHashes = [];
  for (const file of files) fileHashes.push(await getFileSha256(file));
  return fileHashes;
};

export const ImageProvider = ({ children }) => {
  // Each image is { id, file, url, sha256 }: id is the content key, url a
  // blob URL, sha256 the content hash (null outside secure contexts).
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  // One class for the whole batch, as typed. The export sanitizes it; empty
  // keeps the ZIP flat.
  const [className, setClassName] = useState("");

  // Random variants, read by the export. `ranges[key].enabled` mirrors the
  // settings toggles (see syncRangeEnabled); a null seed means one is
  // generated at export.
  const [randomize, setRandomize] = useState(false);
  const [ranges, setRanges] = useState(DEFAULT_RANGES);
  const [variantCount, setVariantCountState] = useState(VARIANT_COUNT_DEFAULT);
  const [seed, setSeed] = useState(null);

  const setVariantCount = useCallback(
    (count) => setVariantCountState(clampVariantCount(count)),
    [],
  );

  // A range can never have its min above its max.
  const setRange = useCallback((key, { min, max }) => {
    setRanges((prev) => ({
      ...prev,
      [key]: { ...prev[key], min: Math.min(min, max), max: Math.max(min, max) },
    }));
  }, []);

  const syncRangeEnabled = useCallback((settings) => {
    setRanges((prev) => syncRangeFlags(prev, settings));
  }, []);

  // The enabled flags stay: they follow the settings toggles, not this reset.
  const resetRandomVariants = useCallback(() => {
    setRandomize(false);
    setRanges((prev) =>
      Object.fromEntries(
        Object.entries(DEFAULT_RANGES).map(([key, range]) => [
          key,
          { ...range, enabled: prev[key].enabled },
        ]),
      ),
    );
    setVariantCountState(VARIANT_COUNT_DEFAULT);
    setSeed(null);
  }, []);

  // Mirrors the list synchronously so addFiles can decide on the warning
  // outside the state updater (React may run updaters twice).
  const uploadedImagesRef = useRef(uploadedImages);

  // Add image files to the list. One call is one user attempt: pass every file
  // of a drop in a single call so each notice shows once. Files whose content
  // is already listed are skipped. Returns the images that were added.
  const addFiles = useCallback(async (files) => {
    let fileHashes;
    try {
      fileHashes = await readFileHashes(files);
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
      const sha256 = fileHashes[index];
      const id = getFileKey(file, sha256);
      if (!listedIds.has(id) && !uniqueFilesById.has(id)) {
        uniqueFilesById.set(id, { file, sha256 });
      }
    });

    if (uniqueFilesById.size < files.length) {
      toast.info(DUPLICATE_NOTICE);
    }
    const addedImages = Array.from(uniqueFilesById)
      .slice(0, MAX_IMAGES - currentImages.length)
      .map(([id, { file, sha256 }]) => ({
        id,
        file,
        url: URL.createObjectURL(file),
        sha256,
      }));

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
      className,
      setClassName,
      randomize,
      setRandomize,
      ranges,
      setRange,
      syncRangeEnabled,
      variantCount,
      setVariantCount,
      seed,
      setSeed,
      resetRandomVariants,
    }),
    [
      uploadedImages,
      selectedImage,
      addFiles,
      removeImage,
      setSelected,
      className,
      randomize,
      ranges,
      setRange,
      syncRangeEnabled,
      variantCount,
      setVariantCount,
      seed,
      resetRandomVariants,
    ],
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
