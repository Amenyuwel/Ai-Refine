"use client";
import Toast, { showToast } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Download from "@/feature/upload/Download";
import Share from "@/components/Share";
import React, { useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import DragOverlay from "@/components/DragOverlay";
import ImageFooter from "@/feature/upload/ImageFooter";
import ControlsModal from "@/feature/upload/ControlsModal";
import { useRouter } from "next/navigation";
import { useImageContext } from "../../context/ImageContext";

const ControlsPage = () => {
  const router = useRouter();
  const {
    uploadedImages,
    selectedImage: previewImage,
    addImage,
    removeImage,
    setSelected,
  } = useImageContext();
  const imageRef = useRef(null);
  const [modalType, setModalType] = React.useState(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [settings, setSettings] = React.useState({
    grayscale: { value: 0 },
    blur: { enabled: false, value: 0 },
    brightness: { enabled: false, value: 100 },
    flip: { enabled: false, value: 1 },
  });

  // Load images from session storage and mark as initialized.
  const loadRedirectedImages = () => {
    const footer = sessionStorage.getItem("footerImages");

    if (footer) {
      const images = JSON.parse(footer);
      images.forEach((image) => addImage(image));
      setSelected(images[0]);

      // Optional: Clear sessionStorage to prevent duplicates
      sessionStorage.removeItem("footerImages");
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      loadRedirectedImages();
      setIsInitialized(true);
    }
  }, [isInitialized, addImage, setSelected]);

  // Redirect to "/" if there are no images after initialization.
  useEffect(() => {
    if (isInitialized && uploadedImages.length === 0) {
      router.push("/");
    }
  }, [uploadedImages, isInitialized, router]);

  // Function to handle image drop
  const onDrop = async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) return showToast("invalidImage");

    try {
      const files = acceptedFiles.slice(0, 100);
      const newUploadedImages = files.map((file) => URL.createObjectURL(file));

      newUploadedImages.forEach((image) => {
        addImage(image); // Add images to context
      });

      if (!previewImage && newUploadedImages.length > 0) {
        setSelected(newUploadedImages[0]); // Set the first image as the preview
      }

      // Cleanup the object URLs to prevent memory leaks
      setTimeout(() => {
        newUploadedImages.forEach((image) => URL.revokeObjectURL(image));
      }, 5000);
    } catch (error) {
      console.error("Error during upload:", error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    onDrop,
    noClick: true,
  });

  const handleSettingsChange = (updatedSettings) => {
    setSettings(updatedSettings);
  };

  return (
    <main className="flex h-screen w-full flex-col bg-gray-200">
      <Navbar />

      {/* Dragging Dropzone */}
      <div
        {...getRootProps()}
        className={`relative flex h-screen w-full items-center justify-center transition-all duration-300 ${
          isDragActive ? "bg-opacity-80 z-50 bg-[#B2D3A8]" : "bg-main"
        }`}
      >
        <label htmlFor="fileUpload" className="hidden">
          Upload an image
        </label>
        <input id="fileUpload" {...getInputProps()} className="hidden" />

        {/* DragOverlay Component */}
        <DragOverlay isDragActive={isDragActive} />

        {/* Uploaded Image Display */}
        {previewImage && (
          <div
            className={`mr-[20%] flex flex-col items-center ${
              isDragActive ? "opacity-50" : "opacity-100"
            }`}
          >
            <div className="h-auto max-h-[650px] w-auto max-w-[650px] rounded-lg shadow-lg">
              <img
                ref={imageRef}
                src={previewImage}
                alt="Uploaded Preview"
                className="h-auto max-h-[650px] w-auto max-w-[650px] rounded-lg object-contain shadow-lg"
                style={{
                  filter: `
                    grayscale(${settings.grayscale.value}%)
                    blur(${
                      settings.blur.enabled ? settings.blur.value + "px" : "0px"
                    })
                    brightness(${
                      settings.brightness.enabled
                        ? settings.brightness.value + "%"
                        : "100%"
                    })
                  `,
                  transform: `scaleX(${
                    settings.flip.enabled ? settings.flip.value : "1"
                  })`,
                }}
              />
            </div>
            <div className="flex flex-row gap-4 pt-8">
              <Share footerImages={uploadedImages} />
              <Download
                uploadedImages={uploadedImages}
                previewImage={previewImage}
                settings={settings}
              />
              {/* Controls Button */}
              <button
                className="mt-4 cursor-pointer rounded-full bg-[#B7B7B7] px-6 py-2 text-white transition-all duration-300 hover:scale-105 hover:brightness-110"
                style={{ width: "200px", height: "50px" }}
                onClick={() =>
                  setModalType((prev) =>
                    prev === "controls" ? null : "controls",
                  )
                }
              >
                CONTROLS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal & Footer */}
      {modalType && (
        <ControlsModal
          isOpen={modalType}
          type="controls"
          onClose={() => setModalType(false)}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      )}

      <ImageFooter
        onImageClick={setSelected} // Use context's setSelected for image click
        onImageDelete={removeImage} // Use context's removeImage for image delete
      />
      <Toast />
    </main>
  );
};

export default ControlsPage;
