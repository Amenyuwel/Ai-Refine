"use client";
import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_STEPS = [
  {
    element: '[data-tour="toolbar"]',
    popover: {
      title: "Toolbar",
      description:
        "Open Augment to turn on brightness, grayscale, blur, rotate or zoom and drag the sliders. Flip mirrors the image.",
    },
  },
  {
    element: '[data-tour="image-footer"]',
    popover: {
      title: "Your images",
      description:
        "Pick an image to edit, add more with the plus button, or delete the selected one.",
    },
  },
  {
    element: '[data-tour="download"]',
    popover: {
      title: "Download",
      description:
        "Save the edited image, or all your images together as a ZIP file.",
    },
  },
];

// Starts on arrival, only when there is an image to point at. Not remembered between visits.
const useUploadTour = (hasImage) => {
  useEffect(() => {
    if (!hasImage) return;

    const tour = driver({
      showProgress: true,
      steps: TOUR_STEPS,
    });
    tour.drive();
    return () => tour.destroy();
  }, [hasImage]);
};

export default useUploadTour;
