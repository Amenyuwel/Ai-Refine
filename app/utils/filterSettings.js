// Ranges and units for the filter controls, shared by the preview and the export.

// Blur is stored in tenths of a percent of the image's shorter side, so one
// setting gives the same result on every screen and for every image size.
export const BLUR_MAX = 20; // 2% of the shorter side

// Below about 50% images turn nearly black and above about 150% highlights
// clip to white; both throw away detail a model needs.
export const BRIGHTNESS_MIN = 50;
export const BRIGHTNESS_MAX = 150;

// Gaussian standard deviation, in pixels, for an image whose shorter side is
// `shortSide` pixels long.
export const blurSigma = (blurValue, shortSide) => (blurValue / 1000) * shortSide;
