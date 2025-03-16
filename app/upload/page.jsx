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

const ControlsPage = () => {
  const [modalType, setModalType] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state
  const imageRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("invalidImage");
      return;
    }

    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }

    setLoading(true); // Show loader
    setTimeout(() => {
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage(previewUrl);
      sessionStorage.setItem("uploadedImage", previewUrl);
      setLoading(false); // Hide loader
    }, 200); // Simulated loading time
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [] },
    onDrop,
    noClick: true,
  });

  const handleDownload = () => {
    if (!uploadedImage) return;
    const link = document.createElement("a");
    link.href = uploadedImage;
    link.download = "image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedImage = sessionStorage.getItem("uploadedImage");
      if (storedImage) {
        setUploadedImage(storedImage);
      }
    }
  }, []);

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  return (
    <main className="h-screen w-full bg-gray-200 flex flex-col">
      <Navbar />
      <Toast />

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
        {uploadedImage && !loading && (
          <div className="grid grid-cols-[auto_1fr] gap-6 items-center">
            {/* Image + Download Button */}
            <div
              className={`flex flex-col items-center ${
                isDragActive || loading ? "opacity-50" : "opacity-100"
              }`}
            >
              <img
                ref={imageRef}
                src={uploadedImage}
                alt="Uploaded Preview"
                className="max-w-[350px] max-h-[350px] w-auto h-auto rounded-lg shadow-lg object-contain"
              />
              <button
                className="cursor-pointer mt-4 px-6 py-2 rounded-full bg-[#008CFF] hover:brightness-110 text-white transition-all hover:scale-105 duration-300"
                style={{ width: "150px" }}
                onClick={handleDownload}
              >
                DOWNLOAD
              </button>
            </div>

            {/* Control Buttons */}
            <section
              className={`bg-transparent h-auto flex flex-col gap-4 py-8 px-6 rounded-lg w-full ${
                isDragActive || loading ? "opacity-50" : "opacity-100"
              }`}
            >
              <button
                onClick={() => openModal("controls")}
                className="cursor-pointer flex items-center gap-x-4 rounded-lg p-4 bg-white shadow-lg hover:scale-105 transition-all duration-300"
              >
                <AiFillControl className="w-10 h-10 text-main" />
                <p className="text-main text-lg font-semibold">CONTROLS</p>
              </button>

              <button
                onClick={() => openModal("randomize")}
                className="cursor-pointer flex items-center gap-x-4 rounded-lg p-4 bg-white shadow-lg hover:scale-105 transition-all duration-300"
              >
                <FaDiceThree className="w-10 h-10 text-main" />
                <p className="text-main text-lg font-semibold">RANDOMIZE</p>
              </button>
            </section>
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
      <ImageFooter />
    </main>
  );
};

export default ControlsPage;
