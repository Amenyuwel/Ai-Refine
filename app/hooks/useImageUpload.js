import { useState, useCallback } from "react";
import PocketBase from "pocketbase";
import { toast } from "react-toastify";

const useImageUpload = () => {
  const pbUrl = process.env.NEXT_PUBLIC_PB_URL;
  if (!pbUrl) {
    toast.error("PocketBase URL is not defined in the environment variables.");
  }
  const pb = new PocketBase(pbUrl);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Load images from session storage
  const loadRedirectedImages = useCallback(() => {
    try {
      const footer = sessionStorage.getItem("footerImages");
      if (footer) {
        const images = JSON.parse(footer);
        setUploadedImages(images);
        sessionStorage.removeItem("footerImages");
      }
    } catch (error) {
      toast.error("Failed to load images from session storage.");
    }
  }, []);

  // Upload images to PocketBase
  const uploadImages = useCallback(
    async (footerImages) => {
      if (!Array.isArray(footerImages) || footerImages.length === 0) {
        toast.warn("No images to upload.", { autoClose: 5000 });
        return { success: false, message: "No images to upload" };
      }

      try {
        setIsUploading(true);
        const formData = new FormData();

        // Convert image URLs to files
        const imageFiles = await Promise.all(
          footerImages.map(async (imageUrl, index) => {
            const response = await fetch(imageUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch image at ${imageUrl}`);
            }
            const blob = await response.blob();
            return new File([blob], `image_${index}.jpg`, {
              type: blob.type,
            });
          }),
        );

        // Append files to formData
        imageFiles.forEach((file) => formData.append("images", file));

        // Upload to PocketBase
        const record = await pb.collection("uploaded_images").create(formData);
        return { success: true, record };
      } catch (error) {
        toast.error("Image upload failed. Please try again.", {
          autoClose: 2000,
        });
        return { success: false, error };
      } finally {
        setIsUploading(false);
      }
    },
    [pb],
  );

  return {
    uploadImages,
    isUploading,
    uploadedImages,
    loadRedirectedImages,
  };
};

export default useImageUpload;
