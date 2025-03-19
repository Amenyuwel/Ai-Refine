"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Toast, { showToast } from "../components/Toast";
import Image from "next/image";
import { ClipLoader } from "react-spinners";

const HomePage = () => {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // Consolidated function: filters files, updates state, converts to Base64, saves in sessionStorage, and redirects.
  const uploadAndRedirect = (files) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image"));
    if (imageFiles.length + images.length > 100) {
      alert("You can only upload up to 100 images.");
      return;
    }
    const newImages = [...images, ...imageFiles].slice(0, 100);
    setImages(newImages);
    setLoading(true);

    Promise.all(
      newImages.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
          })
      )
    )
      .then((base64Images) => {
        sessionStorage.setItem("previewImage", base64Images[0]);
        sessionStorage.setItem(
          "footerImages",
          JSON.stringify(base64Images.slice(1))
        );
        setLoading(false);
        router.push("/upload");
      })
      .catch((error) => {
        console.error("Error converting images:", error);
        alert("Failed to process images. Please try again.");
        setLoading(false);
      });
  };

  // Updated onDrop to accept both acceptedFiles and fileRejections
  const onDrop = (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      showToast("invalidImage");
    }
    if (acceptedFiles.length > 0) {
      uploadAndRedirect(acceptedFiles);
    }
    setIsDragging(false);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    uploadAndRedirect(files);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    noClick: true,
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => {
      setTimeout(() => setIsDragging(false), 100);
    },
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
      <Toast />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 flex-col">
          <ClipLoader size={50} color={"#000000"} loading={loading} />
          <p className="text-main text-semibold">Uploading...</p>
        </div>
      )}

      {isDragging && (
        <p className="z-60 background-blur-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[9rem] font-bold whitespace-nowrap text-main">
          Drop your image here!
        </p>
      )}

      {isDragging && (
        <>
          <div className="absolute top-8 left-8 w-[80px] h-[80px] border-t-[8px] border-l-[8px] border-white rounded-tl-3xl"></div>
          <div className="absolute top-8 right-8 w-[80px] h-[80px] border-t-[8px] border-r-[8px] border-white rounded-tr-3xl"></div>
          <div className="absolute bottom-8 left-8 w-[80px] h-[80px] border-b-[8px] border-l-[8px] border-white rounded-bl-3xl"></div>
          <div className="absolute bottom-8 right-8 w-[80px] h-[80px] border-b-[8px] border-r-[8px] border-white rounded-br-3xl"></div>
        </>
      )}

      <input {...getInputProps()} ref={fileInputRef} className="hidden" />

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

        <div className="flex justify-between h-[9%] w-[80%] flex-row mt-8">
          <p className="text-main mt-2 text-xl">
            No Image? <br /> Try one of these:
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
