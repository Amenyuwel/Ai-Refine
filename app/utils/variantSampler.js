import {
  BLUR_MAX,
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  ROTATE_MAX,
  ROTATE_MIN,
  ZOOM_MAX,
  ZOOM_MIN,
  blurSigma,
} from "@/utils/filterSettings";
import { createRandom, hashSeed } from "@/utils/random";

const GRAYSCALE_MIN = 0;
const GRAYSCALE_MAX = 100;
const BLUR_MIN = 0;

const clamp = (value, lowest, highest) =>
  Math.min(Math.max(value, lowest), highest);

// Uniform draw inside the user's range, with both ends held to the control's
// bounds so a stored range can never produce a value the UI does not allow.
const drawInRange = (random, range, lowest, highest) => {
  const min = clamp(range.min, lowest, highest);
  const max = clamp(range.max, lowest, highest);
  return min + random() * (max - min);
};

// One variant's export values, in the same shape as getExportFilters. The
// stream comes only from (seed, fileKey, variantIndex), so an image gets the
// same variants whatever order the batch is processed in. Every value is drawn
// even when its augmentation is off, so toggling one augmentation does not
// change the values drawn for the others.
export const sampleVariantSettings = (
  ranges,
  seed,
  fileKey,
  variantIndex,
  width,
  height,
) => {
  const random = createRandom(hashSeed(seed, fileKey, variantIndex));
  const flipped = random() < 0.5;
  const rotateDegrees = drawInRange(
    random,
    ranges.rotate,
    ROTATE_MIN,
    ROTATE_MAX,
  );
  const zoomPercent = drawInRange(random, ranges.zoom, ZOOM_MIN, ZOOM_MAX);
  const grayscalePercent = drawInRange(
    random,
    ranges.grayscale,
    GRAYSCALE_MIN,
    GRAYSCALE_MAX,
  );
  const blurValue = drawInRange(random, ranges.blur, BLUR_MIN, BLUR_MAX);
  const brightnessPercent = drawInRange(
    random,
    ranges.brightness,
    BRIGHTNESS_MIN,
    BRIGHTNESS_MAX,
  );

  return {
    flip: ranges.flip.enabled && flipped,
    rotateDegrees: ranges.rotate.enabled ? rotateDegrees : 0,
    zoomPercent: ranges.zoom.enabled ? zoomPercent : 100,
    grayscalePercent: ranges.grayscale.enabled ? grayscalePercent : 0,
    blurRadius: ranges.blur.enabled
      ? blurSigma(blurValue, Math.min(width, height))
      : 0,
    brightnessPercent: ranges.brightness.enabled ? brightnessPercent : 100,
  };
};
