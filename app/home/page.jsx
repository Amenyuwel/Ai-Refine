"use client";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";

const HomePage = () => {
  const router = useRouter();
  const fileInputRef = useRef(null); // Reference for manual file input trigger

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const previewUrl = URL.createObjectURL(file);

    sessionStorage.setItem("uploadedImage", previewUrl);
    router.push("/upload");
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop,
    noClick: true, // Prevents clicking anywhere from opening the file picker
  });

  const preventImageActions = (event) => {
    event.preventDefault();
  };

  return (
    <main
      {...getRootProps()} // Whole page accepts drag-and-drop
      className="h-screen w-full bg-main flex items-center justify-center"
    >
      <input {...getInputProps()} ref={fileInputRef} className="hidden" />

      {/* Left Section (Image & Text) */}
      <section className="flex flex-col items-center relative">
        <img
          src="/images/pixel.png"
          alt="Pixel"
          draggable="false" // Prevent dragging
          onDragStart={preventImageActions} // Prevent dragging events
          onContextMenu={preventImageActions} // Disable right-click on image
          className="cursor-pointer h-full w-full object-contain transition-transform duration-300 ease-out hover:scale-105"
        />
        <h1 className="text-main text-left text-6xl font-bold text-gray-800 mt-4 leading-tight">
          AUGMENT YOUR <br /> IMAGES
        </h1>
      </section>

      {/* Right Section (Upload) */}
      <section className="h-full w-[40%] bg-main flex items-center flex-col justify-center">
        <div className="flex flex-col w-[80%] h-[60%] rounded-[50px] bg-white shadow-xl elevation-3 items-center justify-center">
          <button
            type="button"
            className="text-sans rounded-full h-[10%] w-[40%] bg-[#008CFF] text-white text-2xl shadow-md cursor-pointer"
            onClick={() => fileInputRef.current?.click()} // Manually triggers file picker
          >
            UPLOAD IMAGE
          </button>
          <p className="text-main pt-2">OR DRAG YOUR IMAGE</p>
        </div>
        <p className="text-main text-2xl mt-4">
          Quickly generate dataset variations
        </p>

        {/* Example Images Section */}
        <div className="flex justify-between h-[9%] w-[80%] bg-main flex-row mt-4">
          <p className="text-main mt-2 text-xl">
            No Image? <br />
            Try one of these:
          </p>
          <div className="h-full w-26 bg-white rounded-[12px] shadow-md">
            <img
              src="/images/Animal.png"
              alt="Animal"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="h-full w-26 bg-white rounded-[12px] shadow-md">
            <img
              src="/images/Object.png"
              alt="Object"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="h-full w-26 bg-white rounded-[12px] shadow-md">
            <img
              src="/images/Pest.png"
              alt="Pest"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
