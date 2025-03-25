import React from "react";
import pb from "@/utils/pocketbase";
import PocketBase from "pocketbase";

const Share = ({ previewImage, footerImages }) => {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

  const uploadImages = async () => {
    if (footerImages.length === 0) {
      alert("No images to upload!");
      return;
    }

    try {
      const formData = new FormData();

      // Convert footer image URLs to files
      const imageFiles = await Promise.all(
        footerImages.map(async (imageUrl, index) => {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image at ${imageUrl}`);
          }
          const blob = await response.blob();
          return new File([blob], `image_${index}.jpg`, { type: blob.type });
        }),
      );

      // Append files to the "images" field in formData
      imageFiles.forEach((file) => formData.append("images", file));

      // Upload to PocketBase
      const record = await pb.collection("uploaded_images").create(formData);

      alert("Images uploaded successfully!");
      console.log("Upload response:", record);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload images. Please check the console for details.");
    }
  };

  return (
    <main className="flex">
      <button
        className="mt-4 cursor-pointer rounded-full px-6 py-2 text-black transition-all duration-300 hover:scale-105"
        style={{ width: "200px", height: "50px" }}
        onClick={uploadImages}
      >
        SHARE DATASET
      </button>
    </main>
  );
};

export default Share;
