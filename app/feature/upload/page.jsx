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
import { toast } from "react-toastify";
import Navbar from "components/Navbar";
import DragOverlay from "components/DragOverlay";
import ImageFooter from "@/feature/upload/ImageFooter";
import ControlsModal from "@/feature/upload/ControlsModal";
import Download from "@/feature/upload/Download";
import Share from "components/Share";
import { useImageContext } from "../../context/ImageContext";
import "react-toastify/dist/ReactToastify.css";
import BuildCircleIcon from "@mui/icons-material/BuildCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [settings, setSettings] = useState({
    grayscale: { value: 0 },
    blur: { enabled: false, value: 0 },
    brightness: { enabled: false, value: 100 },
    flip: { enabled: false, value: 1 },
  });

  // Load images from session storage
  const loadRedirectedImages = useCallback(() => {
    try {
      const footer = sessionStorage.getItem("footerImages");
      if (footer) {
        const images = JSON.parse(footer);
        images.forEach((image) => addImage(image));
        setSelected(images[0]);
        sessionStorage.removeItem("footerImages");
      }
    } catch (error) {
      console.error("Error loading images from session storage:", error);
      toast.error("Failed to load images from session storage.");
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

        {/* Image and Controls Container */}
        {previewImage && (
          <div className="flex w-full flex-1 flex-col lg:flex-row gap-4 px-4 items-center lg:items-start justify-center">
            {/* Uploaded Image Display */}
            <div
              className={`relative flex flex-col items-center${
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
                  className="bg-main text-main flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-500 px-4 py-2 text-sm transition-all duration-300 hover:scale-105 hover:bg-[var(--primary)] sm:px-6 sm:text-base lg:hidden"
                  onClick={() => setShowControls(!showControls)}
                >
                  CONTROLS
                  <BuildCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            {/* Controls Panel - Desktop Only */}
            <div className="hidden lg:flex lg:flex-col lg:w-80 lg:rounded-3xl lg:bg-white lg:p-6 lg:shadow-lg">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                CONTROLS
              </h2>
              <p className="text-xs leading-relaxed text-gray-500 mb-6">
                Click the toggle buttons to enable modifications, then use the sliders
                to adjust their intensity.
              </p>

              <div className="space-y-6">
                {/* Flip Toggle */}
                <div className="flex items-center justify-between py-1">
                  <p className="text-main font-sans text-sm font-semibold uppercase">
                    Flip
                  </p>
                  <button
                    onClick={() => {
                      const newSettings = {
                        ...settings,
                        flip: {
                          enabled: !settings.flip.enabled,
                          value: settings.flip.value === 1 ? -1 : 1,
                        },
                      };
                      handleSettingsChange(newSettings);
                    }}
                    className={`relative h-8 w-14 rounded-full p-0.5 transition-colors ${
                      settings.flip.enabled ? "bg-[#79c99e]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                        settings.flip.enabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    ></div>
                  </button>
                </div>

                {/* Grayscale Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <label className="text-main font-sans text-sm font-semibold uppercase">
                      Grayscale
                    </label>
                    <button
                      onClick={() => {
                        const newSettings = {
                          ...settings,
                          grayscale: { ...settings.grayscale, enabled: !settings.grayscale.enabled },
                        };
                        handleSettingsChange(newSettings);
                      }}
                      className={`relative h-8 w-14 rounded-full p-0.5 transition-colors ${
                        settings.grayscale.enabled ? "bg-[#79c99e]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`h-7 w-7 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                          settings.grayscale.enabled ? "translate-x-6" : "translate-x-0"
                        }`}
                      ></div>
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.grayscale.value}
                    onChange={(e) => {
                      const newSettings = {
                        ...settings,
                        grayscale: { ...settings.grayscale, value: parseInt(e.target.value) },
                      };
                      handleSettingsChange(newSettings);
                    }}
                    className="slider h-3 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 outline-none"
                    disabled={!settings.grayscale.enabled}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">0%</span>
                    <span className="text-base font-medium text-gray-700">
                      {settings.grayscale.value}%
                    </span>
                    <span className="text-sm text-gray-500">100%</span>
                  </div>
                </div>

                {/* Blur Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <label className="text-main font-sans text-sm font-semibold uppercase">
                      Blur
                    </label>
                    <button
                      onClick={() => {
                        const newSettings = {
                          ...settings,
                          blur: { ...settings.blur, enabled: !settings.blur.enabled },
                        };
                        handleSettingsChange(newSettings);
                      }}
                      className={`relative h-8 w-14 rounded-full p-0.5 transition-colors ${
                        settings.blur.enabled ? "bg-[#79c99e]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`h-7 w-7 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                          settings.blur.enabled ? "translate-x-6" : "translate-x-0"
                        }`}
                      ></div>
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={settings.blur.value}
                    onChange={(e) => {
                      const newSettings = {
                        ...settings,
                        blur: { ...settings.blur, value: parseInt(e.target.value) },
                      };
                      handleSettingsChange(newSettings);
                    }}
                    className="slider h-3 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 outline-none"
                    disabled={!settings.blur.enabled}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">0%</span>
                    <span className="text-base font-medium text-gray-700">
                      {Math.round(settings.blur.value * 10)}%
                    </span>
                    <span className="text-sm text-gray-500">100%</span>
                  </div>
                </div>

                {/* Brightness Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <label className="text-main font-sans text-sm font-semibold uppercase">
                      Brightness
                    </label>
                    <button
                      onClick={() => {
                        const newSettings = {
                          ...settings,
                          brightness: { ...settings.brightness, enabled: !settings.brightness.enabled },
                        };
                        handleSettingsChange(newSettings);
                      }}
                      className={`relative h-8 w-14 rounded-full p-0.5 transition-colors ${
                        settings.brightness.enabled ? "bg-[#79c99e]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`h-7 w-7 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                          settings.brightness.enabled ? "translate-x-6" : "translate-x-0"
                        }`}
                      ></div>
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={settings.brightness.value}
                    onChange={(e) => {
                      const newSettings = {
                        ...settings,
                        brightness: { ...settings.brightness, value: parseInt(e.target.value) },
                      };
                      handleSettingsChange(newSettings);
                    }}
                    className="slider h-3 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 outline-none"
                    disabled={!settings.brightness.enabled}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">0%</span>
                    <span className="text-base font-medium text-gray-700">
                      {Math.min(100, Math.round(settings.brightness.value / 2))}%
                    </span>
                    <span className="text-sm text-gray-500">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Controls Modal */}
      <ControlsModal
        isOpen={showControls}
        type="controls"
        onClose={() => setShowControls(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      <ImageFooter onImageClick={setSelected} onImageDelete={removeImage} />
    </main>
  );
};

export default ControlsPage;
