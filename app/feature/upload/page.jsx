"use client";
import Toast, { showToast } from "../../components/Toast";
import Navbar from "../../components/Navbar";
import Download from "./Download";
import Share from "../../components/Share";
import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import ImageFooter from "./ImageFooter";
import ControlsModal from "./ControlsModal";
import ClipLoader from "react-spinners/ClipLoader";

const ControlsPage = () => {
  const [modalType, setModalType] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(uploadedImages[0]);
  const [loading, setLoading] = useState(false); // New loading state
  const imageRef = useRef(null);
  const [settings, setSettings] = useState({
    grayscale: { value: 0 }, // Default grayscale is 0%
    blur: { enabled: false, value: 0 }, // Toggle for blur and default value
    brightness: { enabled: false, value: 100 }, // Default brightness is 100%
    flip: { enabled: false, value: 1 }, // 1 (normal), -1 (flipped)
  });

  // Function to handle image drop
  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) return showToast("invalidImage");
    // Maximum of 100 images
    const files = acceptedFiles.slice(0, 100);
    const newUploadedImages = files.map((file) => URL.createObjectURL(file));

    setUploadedImages((prev) => {
      const updatedImages = [...prev, ...newUploadedImages];

      // Set preview image if none exists or if there's only one image
      if (!previewImage || updatedImages.length === 1) {
        setPreviewImage(newUploadedImages[0]);
      }

      sessionStorage.setItem("uploadedImages", JSON.stringify(updatedImages));
      return updatedImages;
    });

    sessionStorage.setItem("previewImage", newUploadedImages[0]);
  };

  // Acceptable formats for images
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    onDrop,
    noClick: true,
  });

  const handleImageClick = (image) => {
    setPreviewImage(image);
  };

  const handleSettingsChange = (updatedSettings) => {
    setSettings(updatedSettings);
  };

  const loadRedirectedImages = () => {
    const preview = sessionStorage.getItem("previewImage");
    const footer = sessionStorage.getItem("footerImages");

    if (preview) {
      setPreviewImage(preview);
      setUploadedImages([preview, ...(footer ? JSON.parse(footer) : [])]);
      return;
    }

    const storedImages = sessionStorage.getItem("uploadedImages");
    if (storedImages) {
      const images = JSON.parse(storedImages);
      setUploadedImages(images);
      setPreviewImage(images[0] || null);
    }
  };

  useEffect(() => {
    loadRedirectedImages();
  }, []);

  const openModal = setModalType;
  const closeModal = () => setModalType(null);

  return (
    <main className="flex h-screen w-full flex-col bg-gray-200">
      <Navbar />

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

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
            <ClipLoader size={50} color={"#000000"} loading={loading} />
            <p className="text-main text-semibold">Uploading...</p>
          </div>
        )}

        {/* Dragging Text */}
        {isDragActive && (
          <p className="background-blur-md text-main absolute top-1/2 left-1/2 z-60 -translate-x-1/2 -translate-y-1/2 transform text-[9rem] font-bold whitespace-nowrap">
            Drop your image here!
          </p>
        )}

        {/* Dragging Corners */}
        {isDragActive && (
          <>
            <div className="absolute top-8 left-8 h-[80px] w-[80px] rounded-tl-3xl border-t-[8px] border-l-[8px] border-white"></div>
            <div className="absolute top-8 right-8 h-[80px] w-[80px] rounded-tr-3xl border-t-[8px] border-r-[8px] border-white"></div>
            <div className="absolute bottom-8 left-8 h-[80px] w-[80px] rounded-bl-3xl border-b-[8px] border-l-[8px] border-white"></div>
            <div className="absolute right-8 bottom-8 h-[80px] w-[80px] rounded-br-3xl border-r-[8px] border-b-[8px] border-white"></div>
          </>
        )}

        {/* Uploaded Image Display */}
        {previewImage && !loading && (
          <div
            className={`mr-[20%] flex flex-col items-center ${
              isDragActive || loading ? "opacity-50" : "opacity-100"
            }`}
          >
            <div className="h-auto max-h-[650px] w-auto max-w-[650px] rounded-lg shadow-lg">
              <img
                ref={imageRef}
                src={previewImage}
                alt="Uploaded Preview"
                className="h-auto max-h-[650px] w-auto max-w-[650px] rounded-lg object-contain shadow-lg"
                style={{
                  filter: `
                    grayscale(${settings.grayscale.value}%)
                    blur(${
                      settings.blur.enabled ? settings.blur.value + "px" : "0px"
                    })
                    brightness(${
                      settings.brightness.enabled
                        ? settings.brightness.value + "%"
                        : "100%"
                    })
                  `,
                  transform: `scaleX(${
                    settings.flip.enabled ? settings.flip.value : "1"
                  })`,
                }}
              />
            </div>
            <div className="flex flex-row gap-4 pt-8">
              <Share />
              <Download
                uploadedImages={uploadedImages}
                previewImage={previewImage}
                settings={settings}
              />
              {/* Controls Button */}
              <button
                className="mt-4 cursor-pointer rounded-full bg-[#B7B7B7] px-6 py-2 text-white transition-all duration-300 hover:scale-105 hover:brightness-110"
                style={{ width: "200px", height: "50px" }}
                onClick={() =>
                  setModalType((prev) =>
                    prev === "controls" ? null : "controls",
                  )
                }
              >
                CONTROLS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal & Footer */}
      {modalType && (
        <ControlsModal
          isOpen={modalType}
          type="controls"
          onClose={() => setModalType(false)}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      )}

      <ImageFooter
        setImages={setUploadedImages}
        onImageClick={handleImageClick}
        images={uploadedImages.slice(1)}
        previewImage={previewImage}
      />
      <Toast />
    </main>
  );
};

export default ControlsPage;
