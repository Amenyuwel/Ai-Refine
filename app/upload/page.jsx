"use client"; // Ensures this is a client-side component
import Navbar from "../components/Navbar"; // Import Navbar
import { MdKeyboardArrowDown } from "react-icons/md";
import React, { useState, useEffect } from "react";

const ControlsPage = () => {
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUploadedImage(sessionStorage.getItem("uploadedImage"));
    }
  }, []);

  return (
    <div className="h-screen w-full bg-gray-200">
      {/* Navbar at the top */}
      <Navbar />

      {/* Centered Content: Image & Button in Column */}
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        {uploadedImage ? (
          <img
            src={uploadedImage}
            alt="Uploaded Preview"
            className="max-w-[80vw] max-h-[60vh] object-contain rounded-lg"
          />
        ) : (
          <p className="text-gray-600">No image uploaded</p>
        )}

        <button className="flex flex-row justify-center items-center gap-2 h-[5%] w-[10%] rounded-[200px] bg-[#008CFF] text-white">
          DOWNLOAD
          {/* OPENS A SELECT */}
          <MdKeyboardArrowDown className="w-auto h-auto" />
        </button>
      </div>
    </div>
  );
};

export default ControlsPage;
