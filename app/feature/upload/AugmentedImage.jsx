"use client";
import Toast, { showToast } from "../../components/Toast";
import Navbar from "../../components/Navbar";
import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import ImageFooter from "./ImageFooter";
import ControlsModal from "./ControlsModal";
import ClipLoader from "react-spinners/ClipLoader";
import AugmentedImage from "./AugmentedImage";
import PocketBase from "pocketbase";

// Helper: Convert dataURL to Blob
const dataURLToBlob = (dataUrl) => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Helper function to permanently augment an image and return a data URL
const getAugmentedDataUrl = (imageUrl, flip, rotation, grayscale, blur) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // needed if image comes from an external source
    img.src = imageUrl;
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const radians = rotation * (Math.PI / 180);
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      const newWidth = Math.floor(width * cos + height * sin);
      const newHeight = Math.floor(width * sin + height * cos);

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");

      // Set filters for grayscale and blur
      ctx.filter = `grayscale(${grayscale}%) blur(${blur}px)`;

      // Translate, rotate and flip
      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(radians);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
  });
};

const pb = new PocketBase("http://127.0.0.1:8090"); // Replace with your Pocketbase URL

const ControlsPage = () => {
  // State for original image management
  const [modalType, setModalType] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef(null);

  // Augmentation parameters (for both preview and permanent augmentation)
  const [flip, setFlip] = useState(false);
  const [rotation, setRotation] = useState(0); // in degrees
  const [grayscale, setGrayscale] = useState(0); // percentage (0-100)
  const [blur, setBlur] = useState(0); // in pixels

  // We store the augmented preview data URL (from AugmentedImage component)
  const [augmentedPreviewUrl, setAugmentedPreviewUrl] = useState(null);

  // Build inline style for real-time preview (CSS only)
  const previewStyle = {
    filter: `grayscale(${grayscale}%) blur(${blur}px)`,
    transform: `${flip ? "scaleX(-1)" : ""} rotate(${rotation}deg)`,
  };

  // Handle file drop/upload
  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      showToast("invalidImage");
      return;
    }
    const files = acceptedFiles.slice(0, 100);
    const newUploadedImages = files.map((file) => URL.createObjectURL(file));
    setUploadedImages((prev) => {
      const updatedImages = [...prev, ...newUploadedImages];
      if (updatedImages.length === 1) {
        setPreviewImage(newUploadedImages[0]);
      } else if (updatedImages.length <= 100 && !previewImage) {
        setPreviewImage(newUploadedImages[0]);
      }
      // Save original images in Pocketbase as well as in sessionStorage
      sessionStorage.setItem("uploadedImages", JSON.stringify(updatedImages));
      // Optionally, you could also upload the original file here to pb.collection("uploadedImages")
      return updatedImages;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    onDrop,
    noClick: true,
  });

  // Download preview (augmented) image and save it to Pocketbase
  const handleDownloadPreview = async () => {
    if (!previewImage) return;
    try {
      const dataURL = await getAugmentedDataUrl(
        previewImage,
        flip,
        rotation,
        grayscale,
        blur,
      );
      // Trigger local download
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "augmented_preview.png";
      link.click();

      // Convert to Blob and upload to Pocketbase
      const blob = dataURLToBlob(dataURL);
      const formData = new FormData();
      formData.append("file", blob, "augmented_preview.png");
      // You can also attach extra metadata fields if needed (e.g., original image URL, parameters)
      const record = await pb.collection("augmentedImages").create(formData);
      console.log("Augmented preview saved to Pocketbase:", record);
    } catch (error) {
      console.error("Error downloading preview:", error);
    }
  };

  // Batch download all images: for each, generate augmented image, download locally, and save to Pocketbase
  const handleBatchDownload = async () => {
    for (let i = 0; i < uploadedImages.length; i++) {
      try {
        const dataURL = await getAugmentedDataUrl(
          uploadedImages[i],
          flip,
          rotation,
          grayscale,
          blur,
        );
        // Trigger local download for each image
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `augmented_image_${i + 1}.png`;
        link.click();

        // Upload each augmented image to Pocketbase
        const blob = dataURLToBlob(dataURL);
        const formData = new FormData();
        formData.append("file", blob, `augmented_image_${i + 1}.png`);
        const record = await pb.collection("augmentedImages").create(formData);
        console.log(`Augmented image ${i + 1} saved to Pocketbase:`, record);
      } catch (error) {
        console.error("Error processing image", i, error);
      }
    }
  };

  // Load images from sessionStorage on mount
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
    <main className="flex h-screen w-full flex-col bg-gray-200">
      <Navbar />

      {/* Augmentation Controls */}
      <div className="flex flex-col gap-4 bg-white p-4 shadow-md">
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white"
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
        className={`relative flex h-screen w-full items-center justify-center transition-all duration-300 ${
          isDragActive ? "bg-opacity-80 z-50 bg-[#B2D3A8]" : "bg-main"
        } ${loading ? "opacity-80 backdrop-blur-md" : ""}`}
      >
        <label htmlFor="fileUpload" className="hidden">
          Upload an image
        </label>
        <input id="fileUpload" {...getInputProps()} className="hidden" />

        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
            <ClipLoader size={50} color={"#000000"} loading={loading} />
            <p className="text-main text-semibold">Uploading...</p>
          </div>
        )}

        {isDragActive && (
          <p className="background-blur-md text-main absolute top-1/2 left-1/2 z-60 -translate-x-1/2 -translate-y-1/2 transform text-[9rem] font-bold whitespace-nowrap">
            Drop your image here!
          </p>
        )}

        {isDragActive && (
          <>
            <div className="absolute top-8 left-8 h-[80px] w-[80px] rounded-tl-3xl border-t-[8px] border-l-[8px] border-white"></div>
            <div className="absolute top-8 right-8 h-[80px] w-[80px] rounded-tr-3xl border-t-[8px] border-r-[8px] border-white"></div>
            <div className="absolute bottom-8 left-8 h-[80px] w-[80px] rounded-bl-3xl border-b-[8px] border-l-[8px] border-white"></div>
            <div className="absolute right-8 bottom-8 h-[80px] w-[80px] rounded-br-3xl border-r-[8px] border-b-[8px] border-white"></div>
          </>
        )}

        {previewImage && !loading && (
          <div
            className={`mr-[20%] flex flex-col items-center ${
              isDragActive || loading ? "opacity-50" : "opacity-100"
            }`}
          >
            {/* Use AugmentedImage component to display a permanent augmented preview */}
            <AugmentedImage
              imageUrl={previewImage}
              flip={flip}
              rotation={rotation}
              grayscale={grayscale}
              blur={blur}
              onDataUrlChange={(url) => setAugmentedPreviewUrl(url)}
            />
            <div className="flex flex-row gap-4 pt-8">
              <button
                className="mt-4 cursor-pointer rounded-full bg-[#008CFF] px-6 py-2 text-white transition-all duration-300 hover:scale-105 hover:brightness-110"
                style={{ width: "150px", height: "50px" }}
                onClick={handleDownloadPreview}
              >
                DOWNLOAD PREVIEW
              </button>
              <button
                className="mt-4 cursor-pointer rounded-full bg-[#B7B7B7] px-6 py-2 text-white transition-all duration-300 hover:scale-105 hover:brightness-110"
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
        <ControlsModal
          isOpen={!!modalType}
          type={modalType}
          onClose={closeModal}
        />
      )}
      <ImageFooter images={uploadedImages.slice(1)} imageStyle={{}} />
      <Toast />
    </main>
  );
};

export default ControlsPage;
