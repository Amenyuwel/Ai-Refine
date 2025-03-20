"use client";
import Toast, { showToast } from "../components/Toast";
import Navbar from "../components/Navbar";
import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import ImageFooter from "./ImageFooter";
import ControlsModal from "./ControlsModal";
import ClipLoader from "react-spinners/ClipLoader"; // Loader for animation

const ControlsPage = () => {
  const [modalType, setModalType] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(uploadedImages[0]);
  const [loading, setLoading] = useState(false); // New loading state
  const imageRef = useRef(null);

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) return showToast("invalidImage");

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

  const handleDownload = () => {
    if (uploadedImages.length === 0) return;

    uploadedImages.forEach((image, index) => {
      const link = document.createElement("a");
      link.href = image;
      link.download = `image_${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
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

  useEffect(loadRedirectedImages, []);

  const openModal = setModalType;
  const closeModal = () => setModalType(null);

  return (
    <main className="h-screen w-full bg-gray-200 flex flex-col">
      <Navbar />

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

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 flex-col">
            <ClipLoader size={50} color={"#000000"} loading={loading} />
            <p className="text-main text-semibold">Uploading...</p>
          </div>
        )}

        {/* Dragging Text */}
        {isDragActive && (
          <p className="z-60 background-blur-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[9rem] font-bold whitespace-nowrap text-main">
            Drop your image here!
          </p>
        )}

        {/* Dragging Corners */}
        {isDragActive && (
          <>
            <div className="absolute top-8 left-8 w-[80px] h-[80px] border-t-[8px] border-l-[8px] border-white rounded-tl-3xl"></div>
            <div className="absolute top-8 right-8 w-[80px] h-[80px] border-t-[8px] border-r-[8px] border-white rounded-tr-3xl"></div>
            <div className="absolute bottom-8 left-8 w-[80px] h-[80px] border-b-[8px] border-l-[8px] border-white rounded-bl-3xl"></div>
            <div className="absolute bottom-8 right-8 w-[80px] h-[80px] border-b-[8px] border-r-[8px] border-white rounded-br-3xl"></div>
          </>
        )}

        {/* Uploaded Image Display */}
        {previewImage && !loading && (
          <div
            className={`flex flex-col items-center  mr-[20%] ${
              isDragActive || loading ? "opacity-50" : "opacity-100"
            }`}
          >
            <img
              ref={imageRef}
              src={previewImage}
              alt="Uploaded Preview"
              className="max-w-[650px] max-h-[650px] w-auto h-auto rounded-lg shadow-lg object-contain"
            />
            <div className="flex flex-row gap-4 pt-8">
              {/* Download Button */}
              <button
                className="cursor-pointer mt-4 px-6 py-2 rounded-full bg-[#008CFF] hover:brightness-110 text-white transition-all hover:scale-105 duration-300"
                style={{ width: "150px", height: "50px" }} // Add height here
                onClick={handleDownload}
              >
                DOWNLOAD
              </button>

              {/* Controls Button */}
              <button
                className="cursor-pointer mt-4 px-6 py-2 rounded-full bg-[#B7B7B7] hover:brightness-110 text-white transition-all hover:scale-105 duration-300"
                style={{ width: "150px", height: "50px" }} // Add height here
                onClick={() => openModal("controls")}
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
          isOpen={!!modalType}
          type={modalType}
          onClose={closeModal}
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
