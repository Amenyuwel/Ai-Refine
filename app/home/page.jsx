"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Toast, { showToast } from "../components/Toast";
import Image from "next/image";
import { ClipLoader } from "react-spinners"; // Importing React Spinner

const HomePage = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleFileUpload = (files) => {
    if (files.length === 0) return;

    setLoading(true);

    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewImage(previewUrls[0]); // Store the first image preview URL

    setTimeout(() => {
      setLoading(false);
      router.push("/upload"); // Redirect to upload page
    }, 2000);
  };

  const onDrop = (acceptedFiles) => {
    setIsDragging(false);

    if (acceptedFiles.length === 0) {
      showToast("noImage");
      return;
    }

    if (acceptedFiles.length > 100) {
      showToast("tooManyImages");
      return;
    }

    const files = acceptedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) {
      showToast("invalidImage");
      return;
    }
    handleFileUpload(files);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    onDrop,
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const preventImageActions = (event) => {
    event.preventDefault();
  };

  return (
    <main
      {...getRootProps()}
      className={`relative h-screen w-full flex items-center justify-center transition-all duration-300 ${
        isDragging ? "bg-[#d3ebc6] bg-opacity-80 z-50" : "bg-main"
      } ${loading ? "backdrop-blur-md" : ""}`}
    >
      {/* Add the Toast Component Here */}
      <Toast />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 flex-col">
          <ClipLoader size={50} color={"#000000"} loading={loading} />{" "}
          {/* Updated loader */}
          <p className="text-main text-semibold">Uploading...</p>
        </div>
      )}

      {/* Text Displayed While Dragging */}
      {isDragging && (
        <p className="z-60 background-blur-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[9rem] font-bold whitespace-nowrap text-main">
          Drop your image here!
        </p>
      )}

      {/* 4 Corner Edges (Shown only while dragging) */}
      {isDragging && (
        <>
          <div className="absolute top-8 left-8 w-[80px] h-[80px] border-t-[8px] border-l-[8px] border-white rounded-tl-3xl"></div>
          <div className="absolute top-8 right-8 w-[80px] h-[80px] border-t-[8px] border-r-[8px] border-white rounded-tr-3xl"></div>
          <div className="absolute bottom-8 left-8 w-[80px] h-[80px] border-b-[8px] border-l-[8px] border-white rounded-bl-3xl"></div>
          <div className="absolute bottom-8 right-8 w-[80px] h-[80px] border-b-[8px] border-r-[8px] border-white rounded-br-3xl"></div>
        </>
      )}

      <input {...getInputProps()} ref={fileInputRef} className="hidden" />

      {/* Left Section (Image & Text) */}
      <section
        className={`flex flex-col items-center relative transition-all duration-300 ${
          isDragging || loading ? "opacity-50" : "opacity-100"
        }`}
      >
        <img
          src="/images/pixel.png"
          alt="Pixel"
          draggable="false"
          onContextMenu={preventImageActions}
          className="cursor-pointer h-full w-full object-contain transition-all duration-300 ease-out hover:scale-105 hover:grayscale"
        />

        <h1 className="text-main text-left text-6xl font-bold text-gray-800 mt-4 leading-tight">
          AUGMENT YOUR <br /> IMAGES
        </h1>
      </section>

      {/* Right Section (Upload) */}
      <section
        className={`h-full w-[40%] flex items-center flex-col justify-center transition-all duration-300 ${
          isDragging || loading ? "opacity-50" : "opacity-100"
        }`}
      >
        <div className="flex flex-col w-[80%] h-[60%] rounded-[50px] bg-white shadow-2xl elevation-3 items-center justify-center">
          <button
            type="button"
            className="text-sans rounded-full h-[10%] w-[40%] bg-[#008CFF] text-white text-2xl shadow-md cursor-pointer transition-all duration-300 ease-in-out hover:bg-[#006FCC] hover:shadow-lg hover:scale-105"
            onClick={() => fileInputRef.current?.click()}
          >
            UPLOAD IMAGE
          </button>
          <p className="text-main py-4">OR DRAG YOUR IMAGE</p>
        </div>

        {/* Example Images Section */}
        <div className="flex justify-between h-[9%] w-[80%] flex-row mt-8">
          <p className="text-main mt-2 text-xl">
            No Image? <br />
            Try one of these:
          </p>
          {["Animal", "Object", "Pest"].map((item) => (
            <div
              title="Drag and drop this image to upload"
              key={item}
              className="h-full w-26 bg-white rounded-[12px] shadow-md cursor-pointer"
            >
              <img
                src={`/images/${item}.png`}
                alt={item}
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>
      </section>
      <Image
        src="/images/light.svg"
        className="rotate-light cursor-pointer absolute bottom-48 left-135"
        alt="Light"
        width={110}
        height={150}
        loading="eager"
      />
    </main>
  );
};

export default HomePage;
