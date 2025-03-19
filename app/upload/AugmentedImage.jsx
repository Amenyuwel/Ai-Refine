"use client";
import Toast, { showToast } from "../components/Toast";
import Navbar from "../components/Navbar";
import { FaDiceThree } from "react-icons/fa";
import { AiFillControl } from "react-icons/ai";
import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import ImageFooter from "./ImageFooter";
import ControlsModal from "./ControlsModal";
import ClipLoader from "react-spinners/ClipLoader"; // Loader for animation

// Helper function that applies permanent augmentations and returns a data URL
const getAugmentedDataUrl = (imageUrl, flip, rotation, grayscale, blur) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Set crossOrigin if needed (for external images)
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      // Original dimensions
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      // Convert rotation (in degrees) to radians
      const radians = rotation * (Math.PI / 180);
      // Compute new canvas dimensions to fully fit the rotated image
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      const newWidth = Math.floor(width * cos + height * sin);
      const newHeight = Math.floor(width * sin + height * cos);

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");

      // Set the filter for grayscale and blur; note that flip/rotation we'll do via transforms
      ctx.filter = `grayscale(${grayscale}%) blur(${blur}px)`;

      // Move the origin to the center of the canvas
      ctx.translate(newWidth / 2, newHeight / 2);
      // Rotate the canvas
      ctx.rotate(radians);
      // Apply horizontal flip if needed
      if (flip) {
        ctx.scale(-1, 1);
      }
      // Draw the image centered at the origin
      ctx.drawImage(img, -width / 2, -height / 2, width, height);

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
  });
};

const ControlsPage = () => {
  // Existing states for image management
  const [modalType, setModalType] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef(null);

  // New augmentation states (for permanent image manipulation)
  const [flip, setFlip] = useState(false);
  const [rotation, setRotation] = useState(0); // degrees
  const [grayscale, setGrayscale] = useState(0); // percentage (0-100)
  const [blur, setBlur] = useState(0); // in pixels

  // For preview, we display the image with CSS filters/transforms
  const previewStyle = {
    filter: `grayscale(${grayscale}%) blur(${blur}px)`,
    transform: `${flip ? "scaleX(-1)" : ""} rotate(${rotation}deg)`
  };

  // File drop/upload handler
  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      showToast("invalidImage");
      return;
    }
    // Limit the number of files to 100
    const files = acceptedFiles.slice(0, 100);
    const newUploadedImages = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prev) => {
      const updatedImages = [...prev, ...newUploadedImages];
      // Set preview image if not already set
      if (updatedImages.length === 1) {
        setPreviewImage(newUploadedImages[0]);
      } else if (updatedImages.length <= 100 && !previewImage) {
        setPreviewImage(newUploadedImages[0]);
      }
      sessionStorage.setItem("uploadedImages", JSON.stringify(updatedImages));
      return updatedImages;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    onDrop,
    noClick: true,
  });

  // Permanent (canvas-based) download for the preview image
  const handleDownloadPreview = async () => {
    if (!previewImage) return;
    try {
      const dataURL = await getAugmentedDataUrl(previewImage, flip, rotation, grayscale, blur);
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "augmented_preview.png";
      link.click();
    } catch (error) {
      console.error("Error downloading preview:", error);
    }
  };

  // Batch download: process all uploaded images using the same augmentation parameters
  const handleBatchDownload = async () => {
    for (let i = 0; i < uploadedImages.length; i++) {
      try {
        const dataURL = await getAugmentedDataUrl(uploadedImages[i], flip, rotation, grayscale, blur);
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `augmented_image_${i + 1}.png`;
        link.click();
      } catch (error) {
        console.error("Error processing image", i, error);
      }
    }
  };

  // Function to load redirected images from sessionStorage
  const loadRedirectedImages = () => {
    const preview = sessionStorage.getItem("previewImage");
    const footer = sessionStorage.getItem("footerImages");
    if (preview) {
      setPreviewImage(preview);
      if (footer) {
        const footerImages = JSON.parse(footer);
        setUploadedImages([preview, ...footerImages]);
      } else {
        setUploadedImages([preview]);
      }
    } else {
      const storedImages = sessionStorage.getItem("uploadedImages");
      if (storedImages) {
        const images = JSON.parse(storedImages);
        setUploadedImages(images);
        setPreviewImage(images[0] || null);
      }
    }
  };

  useEffect(() => {
    loadRedirectedImages();
  }, []);

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  return (
    <main className="h-screen w-full bg-gray-200 flex flex-col">
      <Navbar />

      {/* Augmentation Controls */}
      <div className="p-4 bg-white shadow-md flex flex-col gap-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setFlip((prev) => !prev)}
        >
          Toggle Flip ({flip ? "On" : "Off"})
        </button>
        <div>
          <label>Rotation: {rotation}°</label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Grayscale: {grayscale}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={grayscale}
            onChange={(e) => setGrayscale(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Blur: {blur}px</label>
          <input
            type="range"
            min="0"
            max="10"
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Dragging Dropzone */}
      <div
        {...getRootProps()}
        className={`relative h-screen w-full flex items-center justify-center transition-all duration-300 ${
          isDragActive ? "bg-[#B2D3A8] bg-opacity-80 z-50" : "bg-main"
        } ${loading ? "backdrop-blur-md opacity-80" : ""}`}
      >
        <label htmlFor="fileUpload" className="hidden">
          Upload an image
        </label>
        <input id="fileUpload" {...getInputProps()} className="hidden" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 flex-col">
            <ClipLoader size={50} color={"#000000"} loading={loading} />
            <p className="text-main text-semibold">Uploading...</p>
          </div>
        )}

        {isDragActive && (
          <p className="z-60 background-blur-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[9rem] font-bold whitespace-nowrap text-main">
            Drop your image here!
          </p>
        )}

        {isDragActive && (
          <>
            <div className="absolute top-8 left-8 w-[80px] h-[80px] border-t-[8px] border-l-[8px] border-white rounded-tl-3xl"></div>
            <div className="absolute top-8 right-8 w-[80px] h-[80px] border-t-[8px] border-r-[8px] border-white rounded-tr-3xl"></div>
            <div className="absolute bottom-8 left-8 w-[80px] h-[80px] border-b-[8px] border-l-[8px] border-white rounded-bl-3xl"></div>
            <div className="absolute bottom-8 right-8 w-[80px] h-[80px] border-b-[8px] border-r-[8px] border-white rounded-br-3xl"></div>
          </>
        )}

        {previewImage && !loading && (
          <div
            className={`flex flex-col items-center mr-[20%] ${
              isDragActive || loading ? "opacity-50" : "opacity-100"
            }`}
          >
            <img
              ref={imageRef}
              src={previewImage}
              alt="Uploaded Preview"
              style={previewStyle}
              className="max-w-[650px] max-h-[650px] w-auto h-auto rounded-lg shadow-lg object-contain"
            />
            <div className="flex flex-row gap-4 pt-8">
              <button
                className="cursor-pointer mt-4 px-6 py-2 rounded-full bg-[#008CFF] hover:brightness-110 text-white transition-all hover:scale-105 duration-300"
                style={{ width: "150px", height: "50px" }}
                onClick={handleDownloadPreview}
              >
                DOWNLOAD PREVIEW
              </button>
              <button
                className="cursor-pointer mt-4 px-6 py-2 rounded-full bg-[#B7B7B7] hover:brightness-110 text-white transition-all hover:scale-105 duration-300"
                style={{ width: "150px", height: "50px" }}
                onClick={handleBatchDownload}
              >
                DOWNLOAD ALL
              </button>
            </div>
          </div>
        )}
      </div>

      {modalType && (
        <ControlsModal isOpen={!!modalType} type={modalType} onClose={closeModal} />
      )}
      <ImageFooter images={uploadedImages.slice(1)} imageStyle={previewStyle} />
      <Toast />
    </main>
  );
};

export default ControlsPage;