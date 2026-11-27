// Export rendering. The pixel filters below are for browsers where canvas
// ctx.filter is missing or ignored (WebKit). They follow the CSS filter
// definitions the preview uses, applied in the preview's order: grayscale,
// blur, brightness. The full export order is zoom, rotate, flip, then those
// filters; see applyGeometry.

import { getRotationCoverScale } from "@/utils/filterSettings";

export class FilterError extends Error {}

let nativeFilterSupport;

// Property presence is not enough: some engines expose ctx.filter but ignore it.
// Draw one white pixel through brightness(0) and see if it came out black.
const supportsCanvasFilter = () => {
  if (nativeFilterSupport !== undefined) return nativeFilterSupport;
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const ctx = probe.getContext("2d");
  ctx.filter = "brightness(0)";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 1, 1);
  try {
    nativeFilterSupport = ctx.getImageData(0, 0, 1, 1).data[0] === 0;
  } catch {
    // Unreadable pixels: the pixel path reports this as a FilterError.
    nativeFilterSupport = false;
  }
  return nativeFilterSupport;
};

const yieldToBrowser = () => new Promise((resolve) => setTimeout(resolve));

// CSS grayscale(amount) matrix, amount from 0 to 1.
const applyGrayscale = (pixels, amount) => {
  const keep = 1 - amount;
  const rr = 0.2126 + 0.7874 * keep;
  const rg = 0.7152 - 0.7152 * keep;
  const rb = 0.0722 - 0.0722 * keep;
  const gr = 0.2126 - 0.2126 * keep;
  const gg = 0.7152 + 0.2848 * keep;
  const gb = 0.0722 - 0.0722 * keep;
  const br = 0.2126 - 0.2126 * keep;
  const bg = 0.7152 - 0.7152 * keep;
  const bb = 0.0722 + 0.9278 * keep;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    pixels[i] = rr * r + rg * g + rb * b;
    pixels[i + 1] = gr * r + gg * g + gb * b;
    pixels[i + 2] = br * r + bg * g + bb * b;
  }
};

const applyBrightness = (pixels, factor) => {
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] *= factor;
    pixels[i + 1] *= factor;
    pixels[i + 2] *= factor;
  }
};

// Box widths whose three successive passes approximate a Gaussian of the given
// standard deviation (CSS blur radius is a standard deviation).
const getBoxWidths = (sigma) => {
  const passes = 3;
  const idealWidth = Math.sqrt((12 * sigma * sigma) / passes + 1);
  let lowerWidth = Math.floor(idealWidth);
  if (lowerWidth % 2 === 0) lowerWidth--;
  const upperWidth = lowerWidth + 2;
  const lowerPasses = Math.round(
    (12 * sigma * sigma -
      passes * lowerWidth * lowerWidth -
      4 * passes * lowerWidth -
      3 * passes) /
      (-4 * lowerWidth - 4),
  );
  return Array.from({ length: passes }, (_, pass) =>
    pass < lowerPasses ? lowerWidth : upperWidth,
  );
};

// One box-blur pass along a line of `count` pixels, `step` bytes apart. Pixels
// outside the image count as transparent, like a CSS blur on an image.
const blurLine = (source, target, start, step, count, radius, channels) => {
  const scale = 1 / (2 * radius + 1);
  for (let channel = 0; channel < channels; channel++) {
    const offset = start + channel;
    let sum = 0;
    for (let k = 0; k <= radius && k < count; k++) {
      sum += source[offset + k * step];
    }
    for (let position = 0; position < count; position++) {
      target[offset + position * step] = sum * scale;
      const leaving = position - radius;
      const entering = position + radius + 1;
      if (leaving >= 0) sum -= source[offset + leaving * step];
      if (entering < count) sum += source[offset + entering * step];
    }
  }
};

const blurPass = (source, target, width, height, radius, horizontal) => {
  const lineCount = horizontal ? height : width;
  const lineLength = horizontal ? width : height;
  const step = horizontal ? 4 : width * 4;
  for (let line = 0; line < lineCount; line++) {
    const start = horizontal ? line * width * 4 : line * 4;
    blurLine(source, target, start, step, lineLength, radius, 4);
  }
};

const premultiply = (pixels) => {
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3] / 255;
    pixels[i] *= alpha;
    pixels[i + 1] *= alpha;
    pixels[i + 2] *= alpha;
  }
};

const unpremultiply = (pixels) => {
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha === 0) continue;
    const scale = 255 / alpha;
    pixels[i] *= scale;
    pixels[i + 1] *= scale;
    pixels[i + 2] *= scale;
  }
};

// Returns the blurred pixels; both buffers are the same size and may be swapped.
const applyBlur = async (pixels, width, height, sigma) => {
  premultiply(pixels);
  let source = pixels;
  let target = new Uint8ClampedArray(pixels.length);
  for (const boxWidth of getBoxWidths(sigma)) {
    const radius = (boxWidth - 1) / 2;
    for (const horizontal of [true, false]) {
      blurPass(source, target, width, height, radius, horizontal);
      [source, target] = [target, source];
      // Large images take seconds; let the page paint and stay responsive.
      await yieldToBrowser();
    }
  }
  unpremultiply(source);
  return source;
};

// Applies the filters to a canvas whose content is already drawn (zoom, rotate
// and flip included).
// Throws FilterError when the pixels cannot be read or written, so the caller
// never hands out an unfiltered file as if it were filtered.
const applyFiltersToCanvas = async (
  canvas,
  { grayscalePercent, blurRadius, brightnessPercent },
) => {
  try {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    let pixels = ctx.getImageData(0, 0, width, height).data;

    if (grayscalePercent > 0) applyGrayscale(pixels, grayscalePercent / 100);
    if (blurRadius > 0) {
      pixels = await applyBlur(pixels, width, height, blurRadius);
    }
    if (brightnessPercent !== 100) {
      applyBrightness(pixels, brightnessPercent / 100);
    }

    ctx.putImageData(new ImageData(pixels, width, height), 0, 0);
  } catch (error) {
    throw new FilterError("Could not apply filters to the canvas", {
      cause: error,
    });
  }
};

// Blur pulls in pixels from outside the image, and the canvas counts those as
// transparent, which leaves a see-through band around a blurred export. Padding
// the image with copies of its edge pixels moves that band outside the crop.
// Past 4 standard deviations the Gaussian weight rounds to zero.
const getBlurPadding = (sigma) => (sigma > 0 ? Math.ceil(sigma * 4) : 0);

// The cover scale puts the frame's corners exactly on the rotated image's edge.
// Engines may antialias or interpolate that edge over about a pixel (Chromium
// does not); this many extra edge pixels keep any soft edge outside the frame.
const ROTATED_EDGE_PAD = 2;

// Source padding, in source pixels, so the transformed source covers the frame
// plus the blur padding around it. The image is only ever scaled up, so one
// source pixel is at least one output pixel. Rotated, the farthest point blur
// reads (a corner of the padded frame) lies up to √2 times the blur padding
// away from the image.
const getSourcePadding = (blurPad, rotateDegrees) =>
  rotateDegrees === 0
    ? blurPad
    : Math.ceil(blurPad * Math.SQRT2) + ROTATED_EDGE_PAD;

const createCanvas = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// Safari holds canvas memory until it is resized.
const freeCanvas = (canvas) => {
  canvas.width = 0;
  canvas.height = 0;
};

const createPaddedCanvas = (image, width, height, pad) => {
  const canvas = createCanvas(width + 2 * pad, height + 2 * pad);
  const ctx = canvas.getContext("2d");
  // Nearest-neighbour so the stretched edge strips copy the edge pixels exactly.
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, pad, pad, width, height);
  if (pad === 0) return canvas;

  const right = pad + width;
  const bottom = pad + height;
  const strips = [
    // [source x, y, w, h], [target x, y, w, h]
    [[0, 0, 1, height], [0, pad, pad, height]],
    [[width - 1, 0, 1, height], [right, pad, pad, height]],
    [[0, 0, width, 1], [pad, 0, width, pad]],
    [[0, height - 1, width, 1], [pad, bottom, width, pad]],
    [[0, 0, 1, 1], [0, 0, pad, pad]],
    [[width - 1, 0, 1, 1], [right, 0, pad, pad]],
    [[0, height - 1, 1, 1], [0, bottom, pad, pad]],
    [[width - 1, height - 1, 1, 1], [right, bottom, pad, pad]],
  ];
  for (const [from, to] of strips) ctx.drawImage(image, ...from, ...to);
  return canvas;
};

// Maps image coordinates to frame coordinates, about the image centre, in the
// export's order: zoom, rotate, flip. Zoom crops the middle and scales it back
// to the original size. Rotation also scales up just enough to cover the frame
// (getRotationCoverScale), so no corner is left empty. The preview must match
// with a CSS transform on the image, centre origin, inside a clipping frame:
// `scaleX(-1) rotate(<degrees>deg) scale(<zoom × cover scale>)`, where CSS
// applies the rightmost function first. The filters come after all of this.
const applyGeometry = (
  ctx,
  { width, height, flip, rotateDegrees, zoomPercent },
) => {
  const scale =
    (zoomPercent / 100) * getRotationCoverScale(rotateDegrees, width, height);
  ctx.translate(width / 2, height / 2);
  if (flip) ctx.scale(-1, 1);
  if (rotateDegrees !== 0) ctx.rotate((rotateDegrees * Math.PI) / 180);
  if (scale !== 1) ctx.scale(scale, scale);
  ctx.translate(-width / 2, -height / 2);
};

// Draws `image` at its natural size with zoom, rotate, flip and then the
// filters applied, and returns the canvas. Output size never changes. Opaque
// images stay fully opaque, rotation and blur included.
export const renderImageWithFilters = async (
  image,
  {
    width,
    height,
    flip,
    rotateDegrees,
    zoomPercent,
    grayscalePercent,
    blurRadius,
    brightnessPercent,
  },
) => {
  const filters = { grayscalePercent, blurRadius, brightnessPercent };
  const hasFilterEffect =
    grayscalePercent > 0 || blurRadius > 0 || brightnessPercent !== 100;
  // Without ctx.filter (WebKit) the filters run on the pixels instead.
  // Skipped when no filter changes anything, so unreadable pixels cannot block a plain export.
  const usePixelFilters = hasFilterEffect && !supportsCanvasFilter();
  const blurPad = getBlurPadding(blurRadius);
  const sourcePad = getSourcePadding(blurPad, rotateDegrees);

  const source =
    sourcePad > 0 ? createPaddedCanvas(image, width, height, sourcePad) : image;

  // The blur needs padding around the image: the pixel filters work on the
  // transformed image first, and Firefox's ctx.filter blur stays inside the
  // canvas, which leaves see-through edges. Both draw on a larger canvas that
  // is cropped afterwards.
  const canvasPad = blurPad;
  const canvas = createCanvas(width + 2 * canvasPad, height + 2 * canvasPad);
  const ctx = canvas.getContext("2d");
  if (hasFilterEffect && !usePixelFilters) {
    // Same order as the preview: grayscale, blur, brightness.
    ctx.filter = `grayscale(${grayscalePercent}%) blur(${blurRadius}px) brightness(${brightnessPercent}%)`;
  }
  ctx.translate(canvasPad, canvasPad);
  applyGeometry(ctx, { width, height, flip, rotateDegrees, zoomPercent });
  // The padding is symmetric, so it stays aligned under every transform.
  if (source === image) ctx.drawImage(image, 0, 0, width, height);
  else {
    ctx.drawImage(source, -sourcePad, -sourcePad);
    freeCanvas(source);
  }
  if (usePixelFilters) await applyFiltersToCanvas(canvas, filters);
  if (canvasPad === 0) return canvas;
  const output = createCanvas(width, height);
  output.getContext("2d").drawImage(canvas, -canvasPad, -canvasPad);
  freeCanvas(canvas);
  return output;
};
