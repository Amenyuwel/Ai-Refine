"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Toast, { showToast } from "@/components/Toast";
import Image from "next/image";
import DragOverlay from "@/components/DragOverlay";
import LoadingOverlay from "@/components/LoadingOverlay"; // Import LoadingOverlay

const HomePage = () => {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Loading state:", loading);
  }, [loading]);

  const uploadAndRedirect = async (files) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image"));
    if (imageFiles.length + images.length > 100) {
      alert("You can only upload up to 100 images.");
      return;
    }

    const newImages = [...images, ...imageFiles].slice(0, 100);
    setImages(newImages);

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

      const uniqueImages = Array.from(new Set(base64Images));
      sessionStorage.setItem("footerImages", JSON.stringify(uniqueImages));
      router.push("feature/upload");
    } catch (error) {
      console.error("Error converting images:", error);
      alert("Failed to process images. Please try again.");
    }
  };

  const onDrop = (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      showToast("invalidImage");
    }

    if (acceptedFiles.length > 0) {
      uploadAndRedirect(acceptedFiles);
    }
  };

  const handleFileUpload = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.target.files);
    if (files.length > 0) {
      uploadAndRedirect(files);
    }

    event.target.value = "";
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    noClick: true,
    onDrop,
  });

  const preventImageActions = (event) => {
    event.preventDefault();
  };

  return (
    <main
      {...getRootProps()}
      className={`relative flex h-screen w-full items-center justify-center transition-all duration-300 ${
        loading ? "backdrop-blur-md" : ""
      } ${isDragActive ? "bg-[#b8d5b8]" : ""}`}
    >
      <Toast />

      {/* LoadingOverlay Component */}
      <LoadingOverlay loading={loading} />

      <DragOverlay isDragActive={isDragActive} />

      <input
        {...getInputProps()}
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />

      <section
        className={`relative flex flex-col items-center transition-all duration-300 ${
          isDragActive || loading ? "opacity-50" : "opacity-100"
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
          isDragActive || loading ? "opacity-50" : "opacity-100"
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
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
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
