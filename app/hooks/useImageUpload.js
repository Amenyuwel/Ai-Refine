import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import pb from "../utils/pocketbase";

const useImageUpload = () => {
  // Side effects like toasts must not run during render
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PB_URL) {
      toast.error("PocketBase URL is not defined in the environment variables.");
    }
  }, []);

  const [isUploading, setIsUploading] = useState(false);

  // Upload images to PocketBase
  const uploadImages = useCallback(
    async (images) => {
      if (!Array.isArray(images) || images.length === 0) {
        toast.warn("No images to upload.", { autoClose: 5000 });
        return { success: false, message: "No images to upload" };
      }

      try {
        setIsUploading(true);
        const formData = new FormData();

        // Uploads stay anonymised as image_N: sending the original names is
        // open audit question Q1
        const imageFiles = images.map(
          ({ file }, index) =>
            new File([file], `image_${index}.jpg`, { type: file.type }),
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
    [],
  );

  return {
    uploadImages,
    isUploading,
  };
};

export default useImageUpload;
