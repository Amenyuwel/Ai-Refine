"use client"; // Ensures this is a client-side component
import Navbar from "../components/Navbar"; // Import Navbar
import { FaDiceThree } from "react-icons/fa";
import { AiFillControl } from "react-icons/ai";
import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";

const ControlsPage = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const imageRef = useRef(null);

  // Handle file drop
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setUploadedImage(previewUrl);
      sessionStorage.setItem("uploadedImage", previewUrl);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "image/*",
    onDrop,
    noClick: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUploadedImage(sessionStorage.getItem("uploadedImage"));
    }
  }, []);

  // Function to download the image
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
      {/* Navbar */}
      <Navbar />

      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`relative h-screen w-full flex items-center justify-center transition-all duration-300 ${
          isDragActive ? "bg-[#d3ebc6] bg-opacity-80" : "bg-main"
        }`}
      >
        <input {...getInputProps()} className="hidden" />
        
        {/* Content Wrapper */}
        <div className="flex justify-center items-start w-full bg-green-600 p-8">
          {/* Image Display Section */}
          {uploadedImage && (
            <div className="flex flex-col items-center w-[50%]">
              <img
                ref={imageRef}
                src={uploadedImage}
                alt="Uploaded Preview"
                className="w-[400px] h-[400px] object-contain rounded-lg shadow-lg"
              />
              {/* Download Button */}
              <button
                className="mt-4 px-6 py-2 rounded-full bg-[#008CFF] text-white transition-all"
                style={{ width: "200px" }}
                onClick={handleDownload}
              >
                DOWNLOAD
              </button>
            </div>
          )}

          {/* Controls Section */}
          <div className="bg-main w-[20%] h-auto flex flex-col gap-4 p-4 rounded-lg shadow-md">
            {/* First Control */}
            <button className="cursor-pointer flex items-center gap-x-4 rounded-lg p-4 bg-white shadow">
              <AiFillControl className="w-10 h-10 text-main" />
              <p className="text-main text-lg font-semibold">CONTROLS</p>
            </button>
            {/* Second Control */}
            <button className="cursor-pointer flex items-center gap-x-4 rounded-lg p-4 bg-white shadow">
              <FaDiceThree className="w-10 h-10 text-main" />
              <p className="text-main text-lg font-semibold">RANDOMIZE</p>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-green-600 h-20 flex items-center justify-center text-white text-2xl font-bold">
        Footer (Green)
      </div>
    </div>
  );
};

export default ControlsPage;