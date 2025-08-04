import React from "react";
import { toast } from "react-toastify";
import useImageUpload from "@/hooks/useImageUpload";
import "react-toastify/dist/ReactToastify.css";
import RecommendOutlinedIcon from "@mui/icons-material/RecommendOutlined";

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
    <div className="flex flex-col items-center bg-main rounded-3xl mt-4">
      <button
        className={`text-main cursor-pointer rounded-3xl border border-gray-500 px-6 py-2 transition-all duration-300 hover:scale-105 ${
          isUploading ? "bg-main cursor-not-allowed" : ""
        }`}
        onClick={handleUpload}
        disabled={isUploading}
        aria-label="Share Dataset"
      >
        {isUploading ? "UPLOADING..." : "SHARE"}
        <RecommendOutlinedIcon className="ml-2 h-auto w-auto" />
      </button>
    </div>
  );
};

export default Share;
