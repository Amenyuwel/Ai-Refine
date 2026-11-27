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

const TOUR_SEEN_KEY = "ai-refine:upload-tour-seen";

// Blocked storage reads as "not seen" so the tour still shows instead of crashing.
const hasSeenTour = () => {
  try {
    return localStorage.getItem(TOUR_SEEN_KEY) === "true";
  } catch {
    return false;
  }
};

const markTourSeen = () => {
  try {
    localStorage.setItem(TOUR_SEEN_KEY, "true");
  } catch {
    // Blocked storage only means the tour may show again next visit
  }
};

// Starts on arrival, only when there is an image to point at and the tour has
// not been finished, skipped or closed before in this browser.
const useUploadTour = (hasImage) => {
  useEffect(() => {
    if (!hasImage || hasSeenTour()) return;

    // Cleanup also destroys the tour; that is not the user dismissing it
    let unmounting = false;
    const tour = driver({
      showProgress: true,
      steps: TOUR_STEPS,
      onDestroyed: () => {
        if (!unmounting) markTourSeen();
      },
    });
    tour.drive();
    return () => {
      unmounting = true;
      tour.destroy();
    };
  }, [hasImage]);
};

export default useUploadTour;
