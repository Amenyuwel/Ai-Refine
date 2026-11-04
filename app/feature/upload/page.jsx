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
import ControlsPanel from "@/feature/upload/ControlsPanel";
import Download from "@/feature/upload/Download";
import Share from "components/Share";
import { ACCEPTED_IMAGE_TYPES } from "@/utils/imageTypes";
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
  // Export reads this frame's size to scale blur like the preview does.
  const previewFrameRef = useRef(null);
  const [showControls, setShowControls] = useState(false);
  const [settings, setSettings] = useState({
    grayscale: { enabled: false, value: 0 },
    blur: { enabled: false, value: 0 },
    brightness: { enabled: false, value: 100 },
    flip: { enabled: false, value: 1 },
  });

  // Direct visits with no images have nothing to edit
  useEffect(() => {
    if (uploadedImages.length === 0) router.push("/");
  }, [uploadedImages, router]);

  // Handle image drop
  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        toast.error("Invalid image format.");
        return;
      }

      try {
        const newUploadedImages = acceptedFiles.map((file) =>
          URL.createObjectURL(file),
        );

        // The context cuts the drop down to the limit; free the URLs it left out
        const addedImages = addImage(newUploadedImages);
        newUploadedImages
          .filter((image) => !addedImages.includes(image))
          .forEach((image) => URL.revokeObjectURL(image));
        if (!previewImage && newUploadedImages.length > 0) {
          setSelected(newUploadedImages[0]);
        }
      } catch (error) {
        console.error("Error during upload:", error);
        toast.error("Error during upload. Please try again.");
      }
    },
    [addImage, previewImage, setSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_IMAGE_TYPES,
    onDrop,
    noClick: true,
  });

  const handleSettingsChange = useCallback((updatedSettings) => {
    setSettings(updatedSettings);
  }, []);

  const closeControls = useCallback(() => setShowControls(false), []);

  const imageStyles = useMemo(
    () => ({
      filter: `
      grayscale(${settings.grayscale.enabled ? settings.grayscale.value : 0}%)
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
      <h1 className="sr-only">Upload and augment your images</h1>
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
              <div
                ref={previewFrameRef}
                className="bg-main h-64 w-full max-w-xs overflow-hidden rounded-3xl shadow-lg sm:h-80 sm:max-w-md md:h-96 md:max-w-lg lg:h-[400px] lg:max-w-xl xl:h-[500px] xl:max-w-2xl"
              >
                {/* previewImage is a user-uploaded blob/data URL the optimizer cannot fetch */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={previewImage}
                  alt="Uploaded Preview"
                  className="z-[50] h-full w-full object-contain"
                  style={imageStyles}
                />
              </div>
              <div className="flex w-full max-w-xs flex-col justify-center gap-2 pt-4 sm:max-w-md sm:flex-row sm:gap-4">
                <Share images={uploadedImages} />
                <Download
                  uploadedImages={uploadedImages}
                  previewImage={previewImage}
                  settings={settings}
                  previewFrameRef={previewFrameRef}
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

              <ControlsPanel
                settings={settings}
                onSettingsChange={handleSettingsChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Controls Modal */}
      <ControlsModal
        isOpen={showControls}
        type="controls"
        onClose={closeControls}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      <ImageFooter onImageClick={setSelected} onImageDelete={removeImage} />
    </main>
  );
};

export default ControlsPage;
