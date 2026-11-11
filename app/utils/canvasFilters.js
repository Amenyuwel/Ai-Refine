// Export rendering. The pixel filters below are for browsers where canvas
// ctx.filter is missing or ignored (WebKit). They follow the CSS filter
// definitions the preview uses, applied in the preview's order: grayscale,
// blur, brightness.

export class FilterError extends Error {}

let nativeFilterSupport;

// Property presence is not enough: some engines expose ctx.filter but ignore it.
// Draw one white pixel through brightness(0) and see if it came out black.
export const supportsCanvasFilter = () => {
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

// Applies the filters to a canvas whose content is already drawn (flip included).
// Throws FilterError when the pixels cannot be read or written, so the caller
// never hands out an unfiltered file as if it were filtered.
export const applyFiltersToCanvas = async (
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

const createPaddedCanvas = (image, width, height, pad) => {
  const canvas = document.createElement("canvas");
  canvas.width = width + 2 * pad;
  canvas.height = height + 2 * pad;
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

// Draws `image` at its natural size with the filters (and flip) applied and
// returns the canvas. Opaque images stay fully opaque, blur included.
export const renderImageWithFilters = async (
  image,
  { width, height, flip, grayscalePercent, blurRadius, brightnessPercent },
) => {
  const filters = { grayscalePercent, blurRadius, brightnessPercent };
  const hasFilterEffect =
    grayscalePercent > 0 || blurRadius > 0 || brightnessPercent !== 100;
  const useNativeFilter = supportsCanvasFilter();
  const pad = getBlurPadding(blurRadius);

  let source = image;
  if (pad > 0) source = createPaddedCanvas(image, width, height, pad);
  // Without ctx.filter (WebKit) the filters run on the pixels instead.
  // Skipped when no filter changes anything, so unreadable pixels cannot block a plain export.
  if (hasFilterEffect && !useNativeFilter) {
    if (source === image) source = createPaddedCanvas(image, width, height, 0);
    await applyFiltersToCanvas(source, filters);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (hasFilterEffect && useNativeFilter) {
    // Same order as the preview: grayscale, blur, brightness.
    ctx.filter = `grayscale(${grayscalePercent}%) blur(${blurRadius}px) brightness(${brightnessPercent}%)`;
  }
  // The padding is symmetric, so flipping the padded image keeps it aligned.
  if (flip) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  if (source === image) ctx.drawImage(image, 0, 0, width, height);
  else ctx.drawImage(source, -pad, -pad);

  // Free the padded copy now; Safari holds canvas memory until it is resized.
  if (source !== image) {
    source.width = 0;
    source.height = 0;
  }
  return canvas;
};
