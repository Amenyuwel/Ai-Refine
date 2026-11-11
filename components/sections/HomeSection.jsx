"use client";
import React, { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useImageContext, MAX_IMAGES } from "@/context/ImageContext";
import { useDropzone } from "react-dropzone";
import useWindowFileDrop from "@/hooks/useWindowFileDrop";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import DragOverlay from "components/DragOverlay";
import LoadingOverlay from "components/LoadingOverlay";
import HeroPattern from "components/HeroPattern";
import {
  ACCEPTED_IMAGE_TYPES,
  INVALID_IMAGE_FORMAT_MESSAGE,
  isAcceptedImageFile,
} from "@/utils/imageTypes";

const HomePage = () => {
  const router = useRouter();
  const { addImage, setSelected } = useImageContext();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Hand the files to the editor through the context: object URLs point at the
  // original bytes, so nothing is re-encoded or resized.
  const processImages = useCallback(
    (files) => {
      const imageFiles = files.filter(isAcceptedImageFile);
      if (imageFiles.length < files.length) {
        toast.error(INVALID_IMAGE_FORMAT_MESSAGE);
      }
      if (imageFiles.length === 0) return;

      const imageUrls = imageFiles.map((file) => URL.createObjectURL(file));
      // The context cuts the list to its limit; free the URLs it left out
      const addedImages = addImage(imageUrls);
      imageUrls
        .filter((imageUrl) => !addedImages.includes(imageUrl))
        .forEach((imageUrl) => URL.revokeObjectURL(imageUrl));
      if (addedImages.length === 0) return;

      setSelected(addedImages[0]);
      router.push("/feature/upload");
    },
    [addImage, setSelected, router],
  );

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) toast.error(INVALID_IMAGE_FORMAT_MESSAGE);
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
  // Drag and drop is handled on the window so the navbar is a drop target too
  const isDragActive = useWindowFileDrop(onDrop);
  const { getRootProps, getInputProps } = useDropzone({
    accept: ACCEPTED_IMAGE_TYPES,
    noClick: true,
    noDrag: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative flex min-h-screen w-full flex-col items-center justify-center sm:min-h-screen transition-all duration-300 lg:flex-row ${
        loading ? "backdrop-blur-md" : ""
      } ${isDragActive ? "bg-[#b8d5b8]" : ""}`}
    >
      {/* BACKGROUND */}
      <HeroPattern />

      {/* LOADING SCREEN */}
      <LoadingOverlay loading={loading} />

      {/* DRAGGING SCREEN */}
      <DragOverlay
        isDragActive={isDragActive}
        tintClassName="bg-[#b8d5b8]/80"
      />

      {/* INPUT THAT ACCEPTS THE IMAGES FROM USER VIA DRAGGING */}
      <input
        {...getInputProps()}
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        aria-label="File Upload"
      />

      <section
        className={`relative flex w-full flex-col items-center transition-all duration-300 md:flex-row md:justify-center md:px-6 lg:w-[50%] lg:flex-col lg:px-0 ${
          isDragActive || loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {/* ICON IMAGE */}
        <Image
          src="/images/pixel.png"
          alt=""
          width={666}
          height={375}
          sizes="(min-width: 640px) 50vw, 100vw"
          priority
          draggable="false"
          className="h-full w-full cursor-pointer object-contain pt-4 md:w-1/2 lg:w-full transition-all duration-300 ease-out hover:scale-105 hover:grayscale xl:h-[80%] xl:w-[80%]"
        />
        <h1 className="text-main relative mt-4 ml-10 text-left text-[clamp(2rem,5vw+2rem,4rem)] font-bold md:mt-0 md:ml-4 md:text-[2.5rem] lg:mt-4 lg:ml-10 lg:text-[clamp(2rem,5vw+2rem,4rem)] text-gray-800">
          AUGMENT YOUR <br /> IMAGES
          <span className="-mt-7 -ml-4 inline-block align-middle">
            <Image
              src="/images/Light.svg"
              className="rotate-light cursor-pointer"
              alt=""
              width={100}
              height={100}
            />
          </span>
        </h1>
      </section>

      {/* UPLOAD BUTTON SECTION */}
      <section
        className={`flex h-full w-full flex-col items-center justify-center transition-all duration-300 lg:w-[50%] ${
          isDragActive || loading ? "opacity-55" : "opacity-100"
        }`}
      >
        <div
          onClick={() => fileInputRef.current?.click()}
          className="elevation-3 flex w-[90%] cursor-pointer flex-col items-center justify-center rounded-[20px] bg-white p-3 shadow-2xl lg:w-[80%] lg:max-w-none sm:aspect-[5/4] sm:max-w-lg sm:rounded-[50px] sm:p-4"
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-[8px] border-4 border-dashed border-gray-400 p-4 sm:rounded-[34px] sm:border-8 sm:p-6">
            <p className="text-main text-center text-xl font-bold sm:text-3xl">
              Drag and drop your images
            </p>
            <p className="text-main mt-1 mb-4 text-center text-xl font-bold sm:mb-8 sm:text-3xl">
              or{" "}
              <span className="cursor-pointer text-[var(--secondary)] underline">
                click to upload.
              </span>
            </p>
            <button
              type="button"
              className="cursor-pointer rounded-full bg-[var(--primary)] px-6 py-3 text-lg text-main shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:brightness-105 sm:px-8 sm:py-4 sm:text-2xl"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              UPLOAD IMAGE
            </button>
            <span className="text-main mt-4 text-center text-xs sm:mt-8 sm:text-sm">
              File must be <strong>JPG</strong> or <strong>PNG</strong>, and a
              maximum of <strong>{MAX_IMAGES} images.</strong>
            </span>
          </div>
        </div>

        {/* EXAMPLES */}
        <div className="mt-4 flex h-auto w-[90%] flex-col items-center sm:mt-8 sm:w-[80%] md:w-[85%] lg:w-[80%] lg:flex-row lg:justify-between">
          <p className="text-main mt-2 text-center text-lg sm:text-xl lg:text-left">
            No Image? <br className="hidden lg:block" /> Try
            one of these:
          </p>
          <div className="mt-4 flex flex-row gap-4 sm:mt-0 sm:gap-4 md:mt-0 lg:mt-0">
            {["Animal", "Object", "Pest"].map((item, index) => (
              <button
                type="button"
                key={item}
                aria-label={`Try the ${item} example image`}
                className={`flex h-24 w-24 cursor-pointer items-center justify-center rounded-[12px] bg-white shadow-md transition-transform duration-300 ease-in-out hover:scale-105 sm:h-28 sm:w-28 xl:h-32 xl:w-32 ${
                  index === 2 ? "md:hidden lg:hidden xl:flex" : ""
                }`}
                onClick={() => handleExampleImageClick(`/images/${item}.png`)}
              >
                <Image
                  src={`/images/${item}.png`}
                  alt=""
                  width={128}
                  height={128}
                  sizes="128px"
                  className="h-full w-full rounded-[8px] object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
