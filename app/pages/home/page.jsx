"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Toast, { showToast } from "@/components/Toast";
import Image from "next/image";
import { ClipLoader } from "react-spinners";

const HomePage = () => {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // Monitor loading changes for debugging
  useEffect(() => {
    console.log("Loading state:", loading);
  }, [loading]);

  // Converts images to Base64 and handles redirection
  const uploadAndRedirect = async (files) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image"));
    if (imageFiles.length + images.length > 100) {
      alert("You can only upload up to 100 images.");
      return;
    }

    const newImages = [...images, ...imageFiles].slice(0, 100);
    setImages(newImages);
    setLoading(true);

    try {
      const base64Images = await Promise.all(
        newImages.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
            }),
        ),
      );

      // Store all images in footerImages, including the first one
      sessionStorage.setItem("previewImage", base64Images[0]);
      sessionStorage.setItem("footerImages", JSON.stringify(base64Images));

      // ⏳ Add 2-second delay before stopping loading & navigating
      setTimeout(() => {
        setLoading(false);
        router.push("feature/upload");
      }, 2000);
    } catch (error) {
      console.error("Error converting images:", error);
      alert("Failed to process images. Please try again.");
      setLoading(false);
    }
  };

  // Handles dropped files
  const onDrop = (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      showToast("invalidImage");
    }

    if (acceptedFiles.length > 0) {
      uploadAndRedirect(acceptedFiles);
    }

    setIsDragging(false); // Ensure dragging state resets
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
      className={`relative flex h-screen w-full items-center justify-center transition-all duration-300 ${
        loading ? "backdrop-blur-md" : ""
      } ${isDragging ? "bg-[var(--primary)]" : ""}`}
    >
      <Toast />

      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
          <ClipLoader size={50} color={"#000000"} loading={loading} />
          <p className="text-main text-semibold">Uploading...</p>
        </div>
      )}

      {isDragging && (
        <p className="background-blur-md absolute top-1/2 left-1/2 z-60 -translate-x-1/2 -translate-y-1/2 transform rounded-xl bg-transparent p-4 text-[9rem] font-bold whitespace-nowrap text-white">
          Drop your image here!
        </p>
      )}

      {isDragging && (
        <>
          <div className="absolute top-8 left-8 h-[80px] w-[80px] rounded-tl-3xl border-t-[8px] border-l-[8px] border-white"></div>
          <div className="absolute top-8 right-8 h-[80px] w-[80px] rounded-tr-3xl border-t-[8px] border-r-[8px] border-white"></div>
          <div className="absolute bottom-8 left-8 h-[80px] w-[80px] rounded-bl-3xl border-b-[8px] border-l-[8px] border-white"></div>
          <div className="absolute right-8 bottom-8 h-[80px] w-[80px] rounded-br-3xl border-r-[8px] border-b-[8px] border-white"></div>
        </>
      )}

      <input {...getInputProps()} ref={fileInputRef} className="hidden" />

      <section
        className={`relative flex flex-col items-center transition-all duration-300 ${
          isDragging || loading ? "opacity-50" : "opacity-100"
        }`}
      >
        <img
          src="/images/pixel.png"
          alt="Pixel"
          draggable="false"
          onContextMenu={preventImageActions}
          className="h-full w-full cursor-pointer object-contain transition-all duration-300 ease-out hover:scale-105 hover:grayscale"
        />

        <h1 className="text-main relative mt-4 text-left text-6xl leading-tight font-bold text-gray-800">
          AUGMENT YOUR <br /> IMAGES
          <span className="-mt-7 -ml-4 inline-block align-middle">
            <Image
              src="/images/light.svg"
              className="rotate-light cursor-pointer"
              alt="Light"
              width={100}
              height={100}
              loading="eager"
            />
          </span>
        </h1>
      </section>

      <section
        className={`flex h-full w-[40%] flex-col items-center justify-center transition-all duration-300 ${
          isDragging || loading ? "opacity-50" : "opacity-100"
        }`}
      >
        <div
          onClick={() => fileInputRef.current?.click()}
          className="elevation-3 flex h-[60%] w-[80%] cursor-pointer flex-col items-center justify-center rounded-[50px] bg-white shadow-2xl"
        >
          <div className="flex h-[95%] w-[95%] border-spacing-4 cursor-pointer flex-col items-center justify-center rounded-[50px] border-8 border-dashed border-gray-400">
            <p className="text-main text-3xl font-bold">
              Drag and drop your images
            </p>
            <p className="text-main mt-1 mb-8 text-3xl font-bold">
              or{" "}
              <span className="cursor-pointer text-[#79C99E] underline">
                click to upload.
              </span>
            </p>

            <button
              type="button"
              className="h-[10%] w-[40%] cursor-pointer rounded-full bg-[var(--secondary)] text-2xl text-white shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#79C99E] hover:shadow-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              UPLOAD IMAGE
            </button>

            <span className="text-main mt-8 text-sm">
              File must be JPG or PNG, and up to 100 images.
            </span>
          </div>
        </div>

        <div className="mt-8 flex h-[9%] w-[80%] flex-row justify-between">
          <p className="text-main mt-2 text-xl">
            No Image? <br /> Try one of these:
          </p>
          {["Animal", "Object", "Pest"].map((item) => (
            <div
              title="Drag and drop this image to upload"
              key={item}
              className="h-full w-26 cursor-pointer rounded-[12px] bg-white shadow-md"
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
    </main>
  );
};

export default HomePage;
