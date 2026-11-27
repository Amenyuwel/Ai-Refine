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

// The effects with a switch in the Augment panel. Flip has its own toolbar
// button, so it is not among them.
const EFFECT_KEYS = ["grayscale", "blur", "brightness", "rotate", "zoom"];

// Switches every panel effect off and keeps the slider values. Returns the same
// object when none is on, so callers can skip a history step.
export const disableEffects = (settings) => {
  if (EFFECT_KEYS.every((key) => !settings[key].enabled)) return settings;
  const next = { ...settings };
  EFFECT_KEYS.forEach((key) => {
    next[key] = { ...settings[key], enabled: false };
  });
  return next;
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

// Variants per image when randomize is on.
export const VARIANT_COUNT_MIN = 1;
export const VARIANT_COUNT_MAX = 100;
export const VARIANT_COUNT_DEFAULT = 5;

export const clampVariantCount = (count) =>
  Math.min(Math.max(count, VARIANT_COUNT_MIN), VARIANT_COUNT_MAX);

// Random variants: each enabled augmentation draws from a min-max range. The
// full ranges below match the single sliders' bounds. `enabled` mirrors the
// settings toggle of the same name; flip is a 50% chance and has no range.
export const DEFAULT_RANGES = {
  grayscale: { enabled: false, min: 0, max: 100 },
  blur: { enabled: false, min: 0, max: BLUR_MAX },
  brightness: { enabled: false, min: BRIGHTNESS_MIN, max: BRIGHTNESS_MAX },
  rotate: { enabled: false, min: ROTATE_MIN, max: ROTATE_MAX },
  zoom: { enabled: false, min: ZOOM_MIN, max: ZOOM_MAX },
  flip: { enabled: false },
};

// Copies the settings toggles into the ranges. Returns the same object when
// nothing changed so callers can skip a state update.
export const syncRangeFlags = (ranges, settings) => {
  const isInSync = Object.keys(ranges).every(
    (key) => ranges[key].enabled === settings[key].enabled,
  );
  if (isInSync) return ranges;
  return Object.fromEntries(
    Object.entries(ranges).map(([key, range]) => [
      key,
      { ...range, enabled: settings[key].enabled },
    ]),
  );
};

export const areRangesDefault = (ranges) =>
  Object.entries(DEFAULT_RANGES).every(
    ([key, { min, max }]) => ranges[key].min === min && ranges[key].max === max,
  );

// What the preview shows in randomize mode: each enabled value at the middle
// of its range, and flip left unflipped since it has no range.
export const getMidpointSettings = (settings, ranges) => {
  const midpointSettings = {
    ...settings,
    flip: { ...settings.flip, value: 1 },
  };
  Object.keys(ranges).forEach((key) => {
    if (key === "flip") return;
    midpointSettings[key] = {
      ...settings[key],
      value: Math.round((ranges[key].min + ranges[key].max) / 2),
    };
  });
  return midpointSettings;
};
