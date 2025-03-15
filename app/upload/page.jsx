"use client"
import Toast, { showToast } from "../components/Toast";
import Navbar from "../components/Navbar";
import { FaDiceThree } from "react-icons/fa";
import { AiFillControl } from "react-icons/ai";
import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import ImageFooter from "./ImageFooter";
import ControlsModal from "./ControlsModal";

const ControlsPage = () => {
  const [modalType, setModalType] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const imageRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file!", "error");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadedImage(previewUrl);
    sessionStorage.setItem("uploadedImage", previewUrl);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "image/*",
    onDrop,
    noClick: true,
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file!", "error");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadedImage(previewUrl);
    sessionStorage.setItem("uploadedImage", previewUrl);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUploadedImage(sessionStorage.getItem("uploadedImage"));
    }
  }, []);

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  const handleDownload = () => {
    if (!uploadedImage) return;
    const link = document.createElement("a");
    link.href = uploadedImage;
    link.download = "image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen w-full bg-gray-200 flex flex-col">
      <Navbar />
      <div
        {...getRootProps()}
        className={`relative h-screen w-full flex items-center justify-center transition-all duration-300 ${
          isDragActive ? "bg-[#d3ebc6] bg-opacity-80 z-150" : "bg-main"
        }`}
      >
        <input {...getInputProps()} className="hidden" />
        <div className="flex justify-center items-start w-full bg-main p-8">
          {uploadedImage && (
            <div className="flex flex-col items-center w-[50%]">
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
          )}

          <section className="place-self-center bg-main w-[20%] h-auto flex flex-col gap-4 py-8 px-8 rounded-lg">
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
      </div>

      {modalType && (
        <ControlsModal isOpen={!!modalType} type={modalType} onClose={closeModal} />
      )}

      <ImageFooter />

      {/* Use global Toast component */}
      <Toast />
    </div>
  );
};

export default ControlsPage;
