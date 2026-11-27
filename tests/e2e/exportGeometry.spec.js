import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

// Rotate and zoom have no controls yet, so these tests call the export
// renderer directly. The app's utils are served as plain ES modules from a
// routed origin; the import map resolves the "@/utils/" alias they use.
const UTILS = path.resolve(__dirname, "../../app/utils");
const ORIGIN = "http://canvas.test";
const PAGE = `<!doctype html>
<script type="importmap">{ "imports": { "@/utils/": "/utils/" } }</script>`;

const WIDTH = 120;
const HEIGHT = 80;

const serveUtils = (page) =>
  page.route(`${ORIGIN}/**`, async (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname === "/") {
      return route.fulfill({ contentType: "text/html", body: PAGE });
    }
    const moduleName = pathname.match(/^\/utils\/(\w+)(\.js)?$/)?.[1];
    if (!moduleName) return route.fulfill({ status: 404 });
    return route.fulfill({
      contentType: "text/javascript",
      body: await readFile(path.join(UTILS, `${moduleName}.js`), "utf8"),
    });
  });

// Chromium supports ctx.filter; hiding it sends the export down the pixel
// filter path WebKit takes.
const hideCanvasFilter = (page) =>
  page.addInitScript(() => {
    Object.defineProperty(CanvasRenderingContext2D.prototype, "filter", {
      configurable: true,
      get: () => "none",
      set: () => {},
    });
  });

// Renders an opaque gradient (no channel below 40, so nothing is black)
// through the export and reports the output size, its four corner pixels, the
// lowest alpha, the darkest pixel and the colours needed to check the zoom.
const renderExport = (page, filters) =>
  page.evaluate(
    async ({ width, height, filters }) => {
      const { renderImageWithFilters } = await import(
        "/utils/canvasFilters.js"
      );
      const { getExportFilters } = await import("/utils/filterSettings.js");

      const image = document.createElement("canvas");
      image.width = width;
      image.height = height;
      const imageContext = image.getContext("2d");
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          imageContext.fillStyle = `rgb(${40 + (x * 200) / width}, ${40 + (y * 200) / height}, 200)`;
          imageContext.fillRect(x, y, 1, 1);
        }
      }
      const sourcePixel = (x, y) =>
        Array.from(imageContext.getImageData(x, y, 1, 1).data);

      const output = await renderImageWithFilters(image, {
        width,
        height,
        ...getExportFilters(filters, width, height),
      });
      const pixels = output
        .getContext("2d")
        .getImageData(0, 0, output.width, output.height).data;
      const pixelAt = (x, y) => {
        const start = (y * output.width + x) * 4;
        return Array.from(pixels.slice(start, start + 4));
      };

      let minAlpha = 255;
      let darkestChannelMax = 255;
      for (let i = 0; i < pixels.length; i += 4) {
        minAlpha = Math.min(minAlpha, pixels[i + 3]);
        darkestChannelMax = Math.min(
          darkestChannelMax,
          Math.max(pixels[i], pixels[i + 1], pixels[i + 2]),
        );
      }

      return {
        width: output.width,
        height: output.height,
        corners: [
          pixelAt(0, 0),
          pixelAt(output.width - 1, 0),
          pixelAt(0, output.height - 1),
          pixelAt(output.width - 1, output.height - 1),
        ],
        minAlpha,
        darkestChannelMax,
        sourceAtZoomedTopLeft: sourcePixel(
          Math.round(width / 6),
          Math.round(height / 6),
        ),
      };
    },
    { width: WIDTH, height: HEIGHT, filters },
  );

const ROTATED_AND_ZOOMED = {
  rotate: { enabled: true, value: 30 },
  zoom: { enabled: true, value: 120 },
};

const ROTATED_ZOOMED_FLIPPED_AND_FILTERED = {
  rotate: { enabled: true, value: -30 },
  zoom: { enabled: true, value: 110 },
  flip: { enabled: true, value: -1 },
  grayscale: { enabled: true, value: 50 },
  blur: { enabled: true, value: 20 },
  brightness: { enabled: true, value: 120 },
};

const expectFullFrameNoEmptyCorners = (result) => {
  expect({ width: result.width, height: result.height }).toEqual({
    width: WIDTH,
    height: HEIGHT,
  });
  for (const [, , , alpha] of result.corners) expect(alpha).toBe(255);
  expect(result.minAlpha).toBe(255);
  // The source never goes below 40 per channel; black corners would be near 0.
  expect(result.darkestChannelMax).toBeGreaterThan(30);
};

test.beforeEach(async ({ page }) => {
  await serveUtils(page);
});

test("rotated and zoomed export keeps its size and has no empty corners", async ({
  page,
}) => {
  await page.goto(ORIGIN);
  expectFullFrameNoEmptyCorners(await renderExport(page, ROTATED_AND_ZOOMED));
});

test("rotate, zoom, flip and blur together leave no empty corners", async ({
  page,
}) => {
  await page.goto(ORIGIN);
  expectFullFrameNoEmptyCorners(
    await renderExport(page, ROTATED_ZOOMED_FLIPPED_AND_FILTERED),
  );
});

test("the pixel filter path also leaves no empty corners", async ({ page }) => {
  await hideCanvasFilter(page);
  await page.goto(ORIGIN);
  expectFullFrameNoEmptyCorners(
    await renderExport(page, ROTATED_ZOOMED_FLIPPED_AND_FILTERED),
  );
});

test("zoom 150 crops the middle two thirds and scales it to full size", async ({
  page,
}) => {
  await page.goto(ORIGIN);
  const result = await renderExport(page, {
    zoom: { enabled: true, value: 150 },
  });
  expect({ width: result.width, height: result.height }).toEqual({
    width: WIDTH,
    height: HEIGHT,
  });
  // The output's top-left corner shows the source pixel a sixth of the way in.
  const [red, green, blue] = result.corners[0];
  const [sourceRed, sourceGreen, sourceBlue] = result.sourceAtZoomedTopLeft;
  expect(Math.abs(red - sourceRed)).toBeLessThanOrEqual(3);
  expect(Math.abs(green - sourceGreen)).toBeLessThanOrEqual(3);
  expect(blue).toBe(sourceBlue);
});
