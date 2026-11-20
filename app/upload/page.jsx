"use client";
import React, {
  useEffect,
  useRef,
  useId,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useDropzone } from "react-dropzone";
import useWindowFileDrop from "@/hooks/useWindowFileDrop";
import useSettingsHistory from "@/hooks/useSettingsHistory";
import useUploadTour from "@/hooks/useUploadTour";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Navbar from "components/Navbar";
import DragOverlay from "components/DragOverlay";
import ImageFooter from "@/feature/upload/ImageFooter";
import Toolbar from "@/feature/upload/Toolbar";
import AugmentPanel from "@/feature/upload/AugmentPanel";
import {
  ACCEPTED_IMAGE_TYPES,
  INVALID_IMAGE_FORMAT_MESSAGE,
} from "@/utils/imageTypes";
import {
  DEFAULT_SETTINGS,
  blurSigma,
  getExportFilters,
  getRotationCoverScale,
} from "@/utils/filterSettings";
import { useImageContext } from "../context/ImageContext";
import "react-toastify/dist/ReactToastify.css";
import HeroPattern from "components/HeroPattern";

// Padding between the rounded frame and the image. A 24px corner radius cuts
// about 7px off a square corner, so this keeps the image's own corners visible.
const FRAME_PADDING_PX = 16;
// Canvas size box: the image is scaled to fit inside it, never past MAX_UPSCALE
// times its natural size so small images do not turn blurry.
const CANVAS_MAX_WIDTH_PX = 960;
// cqh is the height of the image area below, so the image fits without scrolling.
const CANVAS_MAX_HEIGHT = `min(100cqh - ${FRAME_PADDING_PX * 2}px, 640px)`;
const MAX_UPSCALE = 2;

const ControlsPage = () => {
  const router = useRouter();
  const {
    uploadedImages,
    selectedImage: previewImage,
    addFiles,
    removeImage,
    setSelected,
  } = useImageContext();

  const imageRef = useRef(null);
  const previewClipRef = useRef(null);
  const imageAreaRef = useRef(null);
  // Shorter side of the image as drawn in the frame, in CSS pixels. Blur is a
  // fraction of the shorter side, so the preview scales it like the export does.
  const [previewShortSide, setPreviewShortSide] = useState(0);
  // The image is centered in its area, which leaves the panel off to the side.
  // Pulling the panel left by half the free space makes both one centered group.
  const [panelShiftPx, setPanelShiftPx] = useState(0);
  const [naturalSize, setNaturalSize] = useState(null);
  const [isAugmentOpen, setIsAugmentOpen] = useState(false);
  const augmentPanelId = useId();
  const history = useSettingsHistory(DEFAULT_SETTINGS);
  const { settings } = history;

  // The frame shrinks to the image as drawn; track that size across image
  // changes and frame resizes.
  useEffect(() => {
    const frame = previewClipRef.current;
    const img = imageRef.current;
    const imageArea = imageAreaRef.current;
    if (!frame || !img || !imageArea) return;

    const measure = () => {
      if (!img.naturalWidth || !frame.clientWidth || !frame.clientHeight)
        return;
      setPanelShiftPx(
        (imageArea.clientWidth - frame.clientWidth - FRAME_PADDING_PX * 2) / 2,
      );
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      const fitScale = Math.min(
        frame.clientWidth / img.naturalWidth,
        frame.clientHeight / img.naturalHeight,
      );
      setPreviewShortSide(
        fitScale * Math.min(img.naturalWidth, img.naturalHeight),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(imageArea);
    img.addEventListener("load", measure);
    return () => {
      observer.disconnect();
      img.removeEventListener("load", measure);
    };
  }, [previewImage]);

  useUploadTour(Boolean(previewImage));

  // Direct visits with no images have nothing to edit
  useEffect(() => {
    if (uploadedImages.length === 0) router.push("/");
  }, [uploadedImages, router]);

  // Handle image drop
  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) toast.error(INVALID_IMAGE_FORMAT_MESSAGE);
      if (acceptedFiles.length === 0) return;

      // The context skips duplicates, cuts the drop to the limit and reports
      // read errors itself
      const addedImages = await addFiles(acceptedFiles);
      if (!previewImage && addedImages.length > 0) {
        setSelected(addedImages[0]);
      }
    },
    [addFiles, previewImage, setSelected],
  );

  // Drag and drop is handled on the window so the navbar is a drop target too
  const isDragActive = useWindowFileDrop(onDrop);
  const { getRootProps, getInputProps } = useDropzone({
    accept: ACCEPTED_IMAGE_TYPES,
    noClick: true,
    noDrag: true,
  });

  // Width is the tightest of: the box width, the width that makes the height fit
  // the box, and the upscale cap. Height follows from the aspect ratio, so the
  // image is never cropped and the frame hugs it.
  const sizeStyles = useMemo(() => {
    if (!naturalSize) return {};
    const { width, height } = naturalSize;
    const aspectRatio = width / height;
    return {
      width: `min(100cqw - ${FRAME_PADDING_PX * 2}px, ${CANVAS_MAX_WIDTH_PX}px, ${width * MAX_UPSCALE}px, calc(min(${CANVAS_MAX_HEIGHT}, ${height * MAX_UPSCALE}px) * ${aspectRatio}))`,
    };
  }, [naturalSize]);

  const imageStyles = useMemo(() => {
    const { rotateDegrees, zoomPercent } = getExportFilters(settings, 1, 1);
    const coverScale = naturalSize
      ? getRotationCoverScale(
          rotateDegrees,
          naturalSize.width,
          naturalSize.height,
        )
      : 1;
    const geometryScale = (zoomPercent / 100) * coverScale;
    // CSS filters run before the transform, so the scale would enlarge the
    // blur; the export blurs after zoom and rotate, so divide it back out.
    const blurPx = settings.blur.enabled
      ? blurSigma(settings.blur.value, previewShortSide) / geometryScale
      : 0;
    // Same order as the export (applyGeometry in canvasFilters.js); the
    // preview frame clips the enlarged image back to the original size.
    // No-effect filters and transforms are left out: they still make the
    // browser draw the image on its own layer, and resampling that layer can
    // smear the edges of an image that should be shown untouched.
    const filters = [];
    if (settings.grayscale.enabled)
      filters.push(`grayscale(${settings.grayscale.value}%)`);
    if (blurPx > 0) filters.push(`blur(${blurPx}px)`);
    if (settings.brightness.enabled)
      filters.push(`brightness(${settings.brightness.value}%)`);
    const transforms = [];
    if (settings.flip.enabled && settings.flip.value !== 1)
      transforms.push(`scaleX(${settings.flip.value})`);
    if (rotateDegrees !== 0) transforms.push(`rotate(${rotateDegrees}deg)`);
    if (geometryScale !== 1) transforms.push(`scale(${geometryScale})`);
    return {
      ...sizeStyles,
      filter: filters.join(" ") || "none",
      transform: transforms.join(" ") || "none",
    };
  }, [settings, previewShortSide, sizeStyles, naturalSize]);

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden">
      <HeroPattern className="absolute inset-0 z-[-50]" />
      <Navbar />
      <h1 className="sr-only">Upload and augment your images</h1>
      {previewImage && (
        <Toolbar
          uploadedImages={uploadedImages}
          previewImage={previewImage}
          settings={settings}
          onSettingsChange={history.change}
          history={history}
          isAugmentOpen={isAugmentOpen}
          onAugmentToggle={() => setIsAugmentOpen((isOpen) => !isOpen)}
          augmentPanelId={augmentPanelId}
        />
      )}

      {/* Dragging Dropzone */}
      <div
        {...getRootProps()}
        className={`relative flex min-h-0 w-full flex-1 overflow-hidden p-2 transition-all duration-300 sm:p-4 md:p-6 ${
          isDragActive ? "bg-opacity-80 z-50 bg-[#B2D3A8]" : ""
        }`}
      >
        <label htmlFor="fileUpload" className="hidden">
          Upload an image
        </label>
        <input id="fileUpload" {...getInputProps()} className="hidden" />

        {/* DragOverlay Component */}
        <DragOverlay
          isDragActive={isDragActive}
          tintClassName="bg-[#B2D3A8]/80"
        />

        {/* Uploaded Image Display */}
        {previewImage && (
          // Panel and image area share the space: stacked on narrow screens, side by side
          // from md up. The image area takes what the panel leaves and the image shrinks to it.
          <div
            className={`relative flex h-full min-h-0 w-full min-w-0 flex-col items-center gap-2 md:flex-row md:gap-6 ${
              isDragActive ? "opacity-50" : "opacity-100"
            }`}
          >
            {isAugmentOpen && (
              <AugmentPanel
                id={augmentPanelId}
                settings={settings}
                onSettingsChange={history.change}
                onSliderDrag={history.drag}
                onSliderRelease={history.release}
                style={{ "--panel-shift": `${panelShiftPx}px` }}
              />
            )}
            <div
              ref={imageAreaRef}
              className="[container-type:size] flex min-h-0 min-w-0 flex-1 items-center justify-center self-stretch"
            >
              {/* The frame wraps the image, so its shape follows the image's aspect ratio */}
              <div
                className="w-fit max-w-full rounded-3xl bg-white shadow-lg"
                style={{ padding: FRAME_PADDING_PX }}
              >
                {/* Clips zoomed or rotated pixels to the image's own bounds */}
                <div ref={previewClipRef} className="overflow-hidden">
                  {/* previewImage is a user-uploaded blob/data URL the optimizer cannot fetch */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imageRef}
                    src={previewImage.url}
                    alt="Uploaded Preview"
                    className="z-[50] block h-auto max-w-full"
                    style={imageStyles}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ImageFooter onImageClick={setSelected} onImageDelete={removeImage} />
    </main>
  );
};

export default ControlsPage;
