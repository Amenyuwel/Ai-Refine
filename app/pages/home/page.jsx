"use client";
import React, { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import DragOverlay from "@/components/DragOverlay";
import LoadingOverlay from "@/components/LoadingOverlay";
import HeroPattern from "@/components/HeroPattern";

const HomePage = () => {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Process images and navigate to the upload page
  const processImages = useCallback(
    async (files) => {
      const imageFiles = files.filter((file) => file.type.startsWith("image"));
      if (imageFiles.length + images.length > 100) {
        toast.error("You can only upload up to 100 images.");
        return;
      }

      setLoading(true);
      try {
        const base64Images = await Promise.all(
          imageFiles.map(
            (file) =>
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              }),
          ),
        );

        const uniqueImages = Array.from(new Set([...images, ...base64Images]));
        sessionStorage.setItem(
          "footerImages",
          JSON.stringify(uniqueImages.slice(0, 100)),
        );
        setImages(uniqueImages.slice(0, 100));
        router.push("feature/upload");
      } catch (error) {
        console.error("Error processing images:", error);
        toast.error("Failed to process images. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [images, router],
  );

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) toast.error("Invalid image format.");
      if (acceptedFiles.length > 0) processImages(acceptedFiles);
    },
    [processImages],
  );

  // Handle file upload via input
  const handleFileUpload = useCallback(
    (event) => {
      const files = Array.from(event.target.files);
      if (files.length > 0) processImages(files);
      event.target.value = ""; // Reset input
    },
    [processImages],
  );

  // Handle example image click
  const handleExampleImageClick = useCallback(
    async (imagePath) => {
      setLoading(true);
      try {
        const response = await fetch(imagePath);
        if (!response.ok)
          throw new Error(`Failed to fetch example image: ${imagePath}`);
        const blob = await response.blob();
        const file = new File([blob], imagePath.split("/").pop(), {
          type: blob.type,
        });
        processImages([file]);
      } catch (error) {
        console.error("Error processing example image:", error);
        toast.error("Failed to process example image. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [processImages],
  );

  // Formats that are acceptable inside the DropZone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    noClick: true,
    onDrop,
  });

  return (
    <main
      {...getRootProps()}
      className={`relative flex flex-col h-screen w-full sm:flex sm:flex-row items-center justify-center transition-all duration-300 ${
        loading ? "backdrop-blur-md" : ""
      } ${isDragActive ? "bg-[#b8d5b8]" : ""}`}
    >
      {/* BACKGROUND */}
      <HeroPattern />

      {/* FOR ERRORS */}
      <ToastContainer pauseOnHover={false} draggable={false} />

      {/* LOADING SCREEN */}
      <LoadingOverlay loading={loading} />

      {/* DRAGGING SCREEN */}
      <DragOverlay isDragActive={isDragActive} />

      {/* INPUT THAT ACCEPTS THE IMAGES FROM USER VIA DRAGGING */}
      <input
        {...getInputProps()}
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        aria-label="File Upload"
      />

      <section
        className={`relative flex flex-col items-center transition-all duration-300 ${
          isDragActive || loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {/* ICON IMAGE */}
        <img
          src="/images/pixel.png"
          alt="Pixel"
          draggable="false"
          className="h-full w-full cursor-pointer object-contain transition-all duration-300 ease-out hover:scale-105 hover:grayscale"
        />
        <h1 className="text-main relative mt-4 text-left text-[clamp(2rem,5vw+2rem,4rem)] font-bold text-gray-800">
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

      {/* UPLOAD BUTTON SECTION */}
      <section
        className={`flex h-full w-full sm:w-[40%] flex-col items-center justify-center transition-all duration-300 ${
          isDragActive || loading ? "opacity-55" : "opacity-100"
        }`}
      >
        <div
          onClick={() => fileInputRef.current?.click()}
          className="elevation-3 flex h-[60%] w-[90%] sm:w-[80%] cursor-pointer flex-col items-center justify-center rounded-[20px] sm:rounded-[50px] bg-white shadow-2xl"
        >
          <div className="flex h-[95%] w-[95%] flex-col items-center justify-center rounded-[20px] sm:rounded-[50px] border-4 sm:border-8 border-dashed border-gray-400 p-4 sm:p-8">
            <p className="text-main text-xl sm:text-3xl font-bold text-center">
              Drag and drop your images
            </p>
            <p className="text-main mt-1 mb-4 sm:mb-8 text-xl sm:text-3xl font-bold text-center">
              or{" "}
              <span className="cursor-pointer text-[var(--secondary)] underline">
                click to upload.
              </span>
            </p>
            <button
              type="button"
              className="cursor-pointer rounded-full bg-[var(--primary)] px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-2xl text-white shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:brightness-105"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              UPLOAD IMAGE
            </button>
            <span className="text-main mt-4 sm:mt-8 text-xs sm:text-sm text-center">
              File must be <strong>JPG</strong> or <strong>PNG</strong>, and a
              maximum of <strong>100 images.</strong>
            </span>
          </div>
        </div>

        {/* EXAMPLES */}
        <div className="mt-4 sm:mt-8 flex h-[9%] w-[90%] sm:w-[80%] flex-col sm:flex-row sm:justify-between items-center">
          <p className="text-main mt-2 text-center sm:text-left text-lg sm:text-xl">
            No Image? <br className="hidden sm:block" /> Try one of these:
          </p>
          <div className="flex flex-row sm:flex-row gap-4 sm:gap-0">
            {["Animal", "Object", "Pest"].map((item) => (
              <div
                key={item}
                className="h-20 w-20 sm:h-full sm:w-26 cursor-pointer rounded-[12px] bg-white shadow-md transition-transform duration-300 ease-in-out hover:scale-105"
                onClick={() => handleExampleImageClick(`/images/${item}.png`)}
              >
                <img
                  src={`/images/${item}.png`}
                  alt={item}
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
