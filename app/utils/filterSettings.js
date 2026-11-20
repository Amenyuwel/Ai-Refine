// Ranges and units for the filter controls, shared by the preview and the export.

// Every setting starts off and at its no-effect value. Flip stores its
// direction in `value` (1 or -1).
export const DEFAULT_SETTINGS = {
  grayscale: { enabled: false, value: 0 },
  blur: { enabled: false, value: 0 },
  brightness: { enabled: false, value: 100 },
  flip: { enabled: false, value: 1 },
  rotate: { enabled: false, value: 0 },
  zoom: { enabled: false, value: 100 },
};

// Blur is stored in tenths of a percent of the image's shorter side, so one
// setting gives the same result on every screen and for every image size.
export const BLUR_MAX = 20; // 2% of the shorter side

// Below about 50% images turn nearly black and above about 150% highlights
// clip to white; both throw away detail a model needs.
export const BRIGHTNESS_MIN = 50;
export const BRIGHTNESS_MAX = 150;

// Rotation in whole degrees; positive turns clockwise, like CSS rotate().
export const ROTATE_MIN = -30;
export const ROTATE_MAX = 30;

// Centre zoom in percent: 150 keeps the middle two thirds of each side and
// scales it back up to the original width and height.
export const ZOOM_MIN = 100;
export const ZOOM_MAX = 150;

// Gaussian standard deviation, in pixels, for an image whose shorter side is
// `shortSide` pixels long.
export const blurSigma = (blurValue, shortSide) => (blurValue / 1000) * shortSide;

// A rotated image leaves empty corners in its own frame. Scaling it up about
// the centre by this factor makes it just cover the frame again: the frame,
// turned back by the same angle, then fits inside the scaled image. This keeps
// every output pixel real image content, with no invented edge pixels.
export const getRotationCoverScale = (degrees, width, height) => {
  const radians = (Math.abs(degrees) * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return Math.max(cos + (height / width) * sin, (width / height) * sin + cos);
};

// The values the export renders with, at the image's natural size. The ZIP
// manifest records these same values, so it lists exactly what was applied.
export const getExportFilters = (settings, width, height) => ({
  flip: Boolean(settings?.flip?.enabled && settings.flip.value === -1),
  rotateDegrees: settings?.rotate?.enabled ? settings.rotate.value : 0,
  zoomPercent: settings?.zoom?.enabled ? settings.zoom.value : 100,
  grayscalePercent: settings?.grayscale?.enabled ? settings.grayscale.value : 0,
  blurRadius: settings?.blur?.enabled
    ? blurSigma(settings.blur.value, Math.min(width, height))
    : 0,
  brightnessPercent: settings?.brightness?.enabled
    ? settings.brightness.value
    : 100,
});
