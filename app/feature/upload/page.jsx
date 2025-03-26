"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "@/components/Navbar";
import DragOverlay from "@/components/DragOverlay";
import ImageFooter from "@/feature/upload/ImageFooter";
import ControlsModal from "@/feature/upload/ControlsModal";
import Download from "@/feature/upload/Download";
import Share from "@/components/Share";
import useImageUpload from "@/hooks/useImageUpload";
import { useImageContext } from "../../context/ImageContext";
import "react-toastify/dist/ReactToastify.css";

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
  const [modalType, setModalType] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [settings, setSettings] = useState({
    grayscale: { value: 0 },
    blur: { enabled: false, value: 0 },
    brightness: { enabled: false, value: 100 },
    flip: { enabled: false, value: 1 },
  });

  // Load images from session storage
  const loadRedirectedImages = useCallback(() => {
    const footer = sessionStorage.getItem("footerImages");
    if (footer) {
      const images = JSON.parse(footer);
      images.forEach((image) => addImage(image));
      setSelected(images[0]);
      sessionStorage.removeItem("footerImages");
    }
  }, [addImage, setSelected]);

  useEffect(() => {
    if (!isInitialized) {
      loadRedirectedImages();
      setIsInitialized(true);
    }
  }, [isInitialized, loadRedirectedImages]);

  useEffect(() => {
    if (isInitialized && uploadedImages.length === 0) {
      router.push("/");
    }
  }, [uploadedImages, isInitialized, router]);

  // Handle image drop
  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        toast.error("Invalid image format.");
        return;
      }

      try {
        const files = acceptedFiles.slice(0, 100);
        const newUploadedImages = files.map((file) =>
          URL.createObjectURL(file),
        );

        newUploadedImages.forEach((image) => addImage(image));
        if (!previewImage && newUploadedImages.length > 0) {
          setSelected(newUploadedImages[0]);
        }

        // Cleanup object URLs
        setTimeout(() => {
          newUploadedImages.forEach((image) => URL.revokeObjectURL(image));
        }, 5000);
      } catch (error) {
        console.error("Error during upload:", error);
        toast.error("Error during upload. Please try again.");
      }
    },
    [addImage, previewImage, setSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    onDrop,
    noClick: true,
  });

  const handleSettingsChange = useCallback((updatedSettings) => {
    setSettings(updatedSettings);
  }, []);

  const imageStyles = useMemo(
    () => ({
      filter: `
      grayscale(${settings.grayscale.value}%)
      blur(${settings.blur.enabled ? settings.blur.value + "px" : "0px"})
      brightness(${settings.brightness.enabled ? settings.brightness.value + "%" : "100%"})
    `,
      transform: `scaleX(${settings.flip.enabled ? settings.flip.value : "1"})`,
    }),
    [settings],
  );

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
                style={imageStyles}
              />
            </div>
            <div className="flex flex-row gap-4 pt-8">
              <Share footerImages={uploadedImages} />
              <Download
                uploadedImages={uploadedImages}
                previewImage={previewImage}
                settings={settings}
              />
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

      <ImageFooter onImageClick={setSelected} onImageDelete={removeImage} />
      <ToastContainer />
    </main>
  );
};

export default ControlsPage;
