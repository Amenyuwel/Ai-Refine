import React from "react";
import { toast } from "react-toastify";
import useImageUpload from "@/hooks/useImageUpload";
import "react-toastify/dist/ReactToastify.css";

const Share = ({ footerImages }) => {
  const { uploadImages, isUploading } = useImageUpload();

  const handleUpload = async () => {
    try {
      const result = await uploadImages(footerImages);
      if (result.success) {
        toast.success("Upload successful!");
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during upload:", error);
      toast.error("An error occurred during upload.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className={`mt-4 cursor-pointer rounded-full px-6 py-2 text-black transition-all duration-300 hover:scale-105 ${
          isUploading ? "cursor-not-allowed bg-gray-300" : "bg-[#79C99E]"
        }`}
        style={{ width: "200px", height: "50px" }}
        onClick={handleUpload}
        disabled={isUploading}
        aria-label="Share Dataset"
      >
        {isUploading ? "UPLOADING..." : "SHARE DATASET"}
      </button>
    </div>
  );
};

export default Share;
