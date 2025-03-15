"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Toast, { showToast } from "../components/Toast";
import { ClipLoader } from "react-spinners"; // Importing React Spinner

const HomePage = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false); // Track if image is uploaded
  const [toastMessage, setToastMessage] = useState(""); // For Toast

  const handleFileUpload = (file) => {
    if (!file) return;

    setLoading(true);
    const previewUrl = URL.createObjectURL(file);
    sessionStorage.setItem("uploadedImage", previewUrl);
    setImageUploaded(true);

    setTimeout(() => {
      setLoading(false);
      router.push("/upload");
    }, 2000);
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      setToastMessage("No image uploaded, please upload an image");
      setTimeout(() => setToastMessage(""), 3000); // Clear the toast after 3 seconds
      return;
    }

    const file = acceptedFiles[0];

    // Check if the uploaded file is an image
    if (!file.type.startsWith("image/")) {
      setToastMessage("Please upload a valid image file (e.g., .jpg, .png, .jpeg)");
      setTimeout(() => setToastMessage(""), 3000); // Clear the toast after 3 seconds
      return;
    }

    setIsDragging(false);  // Reset dragging state to remove green screen
    setLoading(true);

    const previewUrl = URL.createObjectURL(file);
    sessionStorage.setItem("uploadedImage", previewUrl);
    setImageUploaded(true);

    setTimeout(() => {
      setLoading(false);
      router.push("/upload");
    }, 2000);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*", // Ensure only images are accepted
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
        isDragging ? "bg-[#d3ebc6] bg-opacity-80" : "bg-main"
      } ${loading ? "backdrop-blur-md" : ""}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 flex-col">
          <ClipLoader size={50} color={"#000000"} loading={loading} /> {/* Updated loader */}
          <p className="text-main text-semibold">Uploading...</p>
        </div>
      )}

      {/* Text Displayed While Dragging */}
      {isDragging && (
        <p className="z-60 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-main">
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
            className="text-sans rounded-full h-[10%] w-[40%] bg-[#008CFF] text-white text-2xl shadow-md cursor-pointer"
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
              key={item}
              className="h-full w-26 bg-white rounded-[12px] shadow-md"
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

      {/* Toast Message */}
      {toastMessage && <Toast message={toastMessage} />}
    </main>
  );
};

export default HomePage;
