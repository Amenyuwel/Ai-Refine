"use client";
import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// The desktop panel is display:none below lg, where the CONTROLS button opens the modal instead.
const findControlsTarget = () => {
  const panel = document.querySelector('[data-tour="controls-panel"]');
  if (panel?.offsetParent) return panel;
  return document.querySelector('[data-tour="controls-button"]');
};

const TOUR_STEPS = [
  {
    element: findControlsTarget,
    popover: {
      title: "Controls",
      description:
        "Turn on grayscale, blur, brightness or flip, then drag the sliders to adjust them. On small screens, tap CONTROLS to open them.",
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
