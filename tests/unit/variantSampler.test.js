import { expect, test } from "vitest";
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
import { sampleVariantSettings } from "@/utils/variantSampler";

const WIDTH = 400;
const HEIGHT = 300;

const ALL_ENABLED = {
  grayscale: { enabled: true, min: 10, max: 60 },
  blur: { enabled: true, min: 2, max: 12 },
  brightness: { enabled: true, min: 80, max: 120 },
  flip: { enabled: true },
  rotate: { enabled: true, min: -15, max: 15 },
  zoom: { enabled: true, min: 105, max: 140 },
};

const ALL_DISABLED = {
  grayscale: { enabled: false, min: 10, max: 60 },
  blur: { enabled: false, min: 2, max: 12 },
  brightness: { enabled: false, min: 80, max: 120 },
  flip: { enabled: false },
  rotate: { enabled: false, min: -15, max: 15 },
  zoom: { enabled: false, min: 105, max: 140 },
};

const sample = (ranges, seed, fileKey, variantIndex) =>
  sampleVariantSettings(ranges, seed, fileKey, variantIndex, WIDTH, HEIGHT);

test("the same inputs give identical output", () => {
  expect(sample(ALL_ENABLED, 5, "cat", 0)).toEqual(
    sample(ALL_ENABLED, 5, "cat", 0),
  );
});

test("another seed, variant or image gives different output", () => {
  const base = sample(ALL_ENABLED, 5, "cat", 0);
  expect(sample(ALL_ENABLED, 6, "cat", 0)).not.toEqual(base);
  expect(sample(ALL_ENABLED, 5, "cat", 1)).not.toEqual(base);
  expect(sample(ALL_ENABLED, 5, "dog", 0)).not.toEqual(base);
});

test("output does not depend on what was sampled before", () => {
  const first = sample(ALL_ENABLED, 5, "cat", 2);
  sample(ALL_ENABLED, 5, "dog", 0);
  sample(ALL_ENABLED, 5, "bird", 3);
  expect(sample(ALL_ENABLED, 5, "cat", 2)).toEqual(first);
});

test("disabled augmentations return their no-effect values", () => {
  expect(sample(ALL_DISABLED, 5, "cat", 0)).toEqual({
    flip: false,
    rotateDegrees: 0,
    zoomPercent: 100,
    grayscalePercent: 0,
    blurRadius: 0,
    brightnessPercent: 100,
  });
});

test("toggling one augmentation keeps the others' values", () => {
  const withRotate = sample(ALL_ENABLED, 5, "cat", 0);
  const withoutRotate = sample(
    { ...ALL_ENABLED, rotate: { ...ALL_ENABLED.rotate, enabled: false } },
    5,
    "cat",
    0,
  );
  expect(withoutRotate).toEqual({ ...withRotate, rotateDegrees: 0 });
});

test("sampled values stay inside the range", () => {
  const blurSigmaMin = blurSigma(ALL_ENABLED.blur.min, HEIGHT);
  const blurSigmaMax = blurSigma(ALL_ENABLED.blur.max, HEIGHT);
  for (let variantIndex = 0; variantIndex < 500; variantIndex += 1) {
    const filters = sample(ALL_ENABLED, 9, "cat", variantIndex);
    expect(filters.grayscalePercent).toBeGreaterThanOrEqual(10);
    expect(filters.grayscalePercent).toBeLessThanOrEqual(60);
    expect(filters.blurRadius).toBeGreaterThanOrEqual(blurSigmaMin);
    expect(filters.blurRadius).toBeLessThanOrEqual(blurSigmaMax);
    expect(filters.brightnessPercent).toBeGreaterThanOrEqual(80);
    expect(filters.brightnessPercent).toBeLessThanOrEqual(120);
    expect(filters.rotateDegrees).toBeGreaterThanOrEqual(-15);
    expect(filters.rotateDegrees).toBeLessThanOrEqual(15);
    expect(filters.zoomPercent).toBeGreaterThanOrEqual(105);
    expect(filters.zoomPercent).toBeLessThanOrEqual(140);
  }
});

test("ranges outside the control bounds are clamped to them", () => {
  const outOfBounds = {
    grayscale: { enabled: true, min: -50, max: 500 },
    blur: { enabled: true, min: -10, max: 999 },
    brightness: { enabled: true, min: 0, max: 400 },
    flip: { enabled: true },
    rotate: { enabled: true, min: -180, max: 180 },
    zoom: { enabled: true, min: 10, max: 900 },
  };
  for (let variantIndex = 0; variantIndex < 500; variantIndex += 1) {
    const filters = sample(outOfBounds, 3, "cat", variantIndex);
    expect(filters.grayscalePercent).toBeGreaterThanOrEqual(0);
    expect(filters.grayscalePercent).toBeLessThanOrEqual(100);
    expect(filters.blurRadius).toBeGreaterThanOrEqual(0);
    expect(filters.blurRadius).toBeLessThanOrEqual(blurSigma(BLUR_MAX, HEIGHT));
    expect(filters.brightnessPercent).toBeGreaterThanOrEqual(BRIGHTNESS_MIN);
    expect(filters.brightnessPercent).toBeLessThanOrEqual(BRIGHTNESS_MAX);
    expect(filters.rotateDegrees).toBeGreaterThanOrEqual(ROTATE_MIN);
    expect(filters.rotateDegrees).toBeLessThanOrEqual(ROTATE_MAX);
    expect(filters.zoomPercent).toBeGreaterThanOrEqual(ZOOM_MIN);
    expect(filters.zoomPercent).toBeLessThanOrEqual(ZOOM_MAX);
  }
});

test("min equal to max returns that value", () => {
  const fixed = {
    grayscale: { enabled: true, min: 40, max: 40 },
    blur: { enabled: true, min: 5, max: 5 },
    brightness: { enabled: true, min: 110, max: 110 },
    flip: { enabled: false },
    rotate: { enabled: true, min: -7, max: -7 },
    zoom: { enabled: true, min: 120, max: 120 },
  };
  expect(sample(fixed, 1, "cat", 4)).toEqual({
    flip: false,
    rotateDegrees: -7,
    zoomPercent: 120,
    grayscalePercent: 40,
    blurRadius: blurSigma(5, HEIGHT),
    brightnessPercent: 110,
  });
});

test("flip is drawn about half the time", () => {
  let flips = 0;
  for (let variantIndex = 0; variantIndex < 1000; variantIndex += 1) {
    if (sample(ALL_ENABLED, 11, "cat", variantIndex).flip) flips += 1;
  }
  // About 4.4 standard deviations either side of 500.
  expect(flips).toBeGreaterThan(430);
  expect(flips).toBeLessThan(570);
});
