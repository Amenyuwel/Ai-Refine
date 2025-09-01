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
import Navbar from "components/Navbar";
import DragOverlay from "components/DragOverlay";
import ImageFooter from "@/feature/upload/ImageFooter";
import ControlsModal from "@/feature/upload/ControlsModal";
import Download from "@/feature/upload/Download";
import Share from "components/Share";
import { useImageContext } from "../../context/ImageContext";
import "react-toastify/dist/ReactToastify.css";
import BuildCircleIcon from "@mui/icons-material/BuildCircleOutlined";
import HeroPattern from "components/HeroPattern";

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
    <main className="flex h-screen w-full flex-col overflow-hidden">
      <HeroPattern className="absolute inset-0 z-[-50]" />
      <Navbar />
      {/* Dragging Dropzone */}
      <div
        {...getRootProps()}
        className={`relative flex w-full flex-1 items-center justify-center p-2 transition-all duration-300 sm:p-4 md:p-6${
          isDragActive ? "bg-opacity-80 z-50 bg-[#B2D3A8]" : ""
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
            className={`relative flex flex-col items-center px-4 ${
              isDragActive ? "opacity-50" : "opacity-100"
            }`}
          >
            <div className="bg-main h-64 w-full max-w-xs overflow-hidden rounded-3xl shadow-lg sm:h-80 sm:max-w-md md:h-96 md:max-w-lg lg:h-[400px] lg:max-w-xl xl:h-[500px] xl:max-w-2xl">
              <img
                ref={imageRef}
                src={previewImage}
                alt="Uploaded Preview"
                className="z-[50] h-full w-full object-contain"
                style={imageStyles}
              />
            </div>
            <div className="flex w-full max-w-xs flex-col justify-center gap-2 pt-4 sm:max-w-md sm:flex-row sm:gap-4">
              <Share footerImages={uploadedImages} />
              <Download
                uploadedImages={uploadedImages}
                previewImage={previewImage}
                settings={settings}
              />
              <button
                className="bg-main text-main flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-500 px-4 py-2 text-sm transition-all duration-300 hover:scale-105 hover:bg-[var(--primary)] sm:px-6 sm:text-base"
                onClick={() =>
                  setModalType((prev) =>
                    prev === "controls" ? null : "controls",
                  )
                }
              >
                CONTROLS
                <BuildCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
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
