import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { waitForDropListener } from "./waitForDropListener";

// corners.png is 1200x800: a 6px black border and a 80px square in each corner
// (red, yellow, magenta, white), so any smear or crop at a corner shows.
const FIXTURE = path.resolve(__dirname, "../fixtures/corners.png");
const CORNER_COLORS = {
  topLeft: [255, 0, 0],
  topRight: [255, 255, 0],
  bottomLeft: [255, 0, 255],
  bottomRight: [255, 255, 255],
};
// The frame pads the image, so the outermost pixels (the fixture's black border)
// are visible; the colored squares start past the 6px border.
const CORNER_INSET_PX = 8;
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
];

const dropFixture = async (page) => {
  const base64 = (await readFile(FIXTURE)).toString("base64");
  const dataTransfer = await page.evaluateHandle((encoded) => {
    const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], "corners.png", { type: "image/png" }));
    return transfer;
  }, base64);
  await waitForDropListener(page, dataTransfer);
  await page.dispatchEvent("body", "drop", { dataTransfer });
};

for (const viewport of VIEWPORTS) {
  test(`default preview shows the image untouched at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await dropFixture(page);
    await page.waitForURL("**/upload");
    await page.locator(".driver-overlay").first().waitFor();
    await page.keyboard.press("Escape");
    await expect(page.locator(".driver-overlay")).toHaveCount(0);

    const image = page.getByAltText("Uploaded Preview");
    await expect(image).toBeVisible();
    // No-effect filter or transform would still put the image on its own layer
    await expect(image).toHaveCSS("transform", "none");
    await expect(image).toHaveCSS("filter", "none");

    // Decode the screenshot in the page so no PNG library is needed
    const sampled = await page.evaluate(
      async ({ encoded, inset }) => {
        const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
        const bitmap = await createImageBitmap(
          new Blob([bytes], { type: "image/png" }),
        );
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0);
        const rgbAt = (x, y) =>
          Array.from(ctx.getImageData(x, y, 1, 1).data.slice(0, 3));
        const cornersAt = (offset) => ({
          topLeft: rgbAt(offset, offset),
          topRight: rgbAt(bitmap.width - 1 - offset, offset),
          bottomLeft: rgbAt(offset, bitmap.height - 1 - offset),
          bottomRight: rgbAt(
            bitmap.width - 1 - offset,
            bitmap.height - 1 - offset,
          ),
        });
        return { squares: cornersAt(inset), outermost: cornersAt(0) };
      },
      {
        encoded: (await image.screenshot()).toString("base64"),
        inset: CORNER_INSET_PX,
      },
    );
    for (const [corner, expected] of Object.entries(CORNER_COLORS)) {
      expect(sampled.squares[corner], corner).toEqual(expected);
      expect(sampled.outermost[corner], `${corner} outermost`).toEqual([
        0, 0, 0,
      ]);
    }
  });
}

test("default export matches the source pixel for pixel", async ({ page }) => {
  const origin = "http://canvas.test";
  const utils = path.resolve(__dirname, "../../app/utils");
  await page.route(`${origin}/**`, async (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname === "/") {
      return route.fulfill({
        contentType: "text/html",
        body: `<!doctype html><script type="importmap">{ "imports": { "@/utils/": "/utils/" } }</script>`,
      });
    }
    const moduleName = pathname.match(/^\/utils\/(\w+)(\.js)?$/)?.[1];
    if (!moduleName) return route.fulfill({ status: 404 });
    return route.fulfill({
      contentType: "text/javascript",
      body: await readFile(path.join(utils, `${moduleName}.js`), "utf8"),
    });
  });
  await page.goto(`${origin}/`);

  const base64 = (await readFile(FIXTURE)).toString("base64");
  const result = await page.evaluate(async (encoded) => {
    const { renderImageWithFilters } = await import("/utils/canvasFilters.js");
    const { getExportFilters, DEFAULT_SETTINGS } = await import(
      "/utils/filterSettings.js"
    );
    const image = new Image();
    image.src = `data:image/png;base64,${encoded}`;
    await image.decode();
    const { naturalWidth: width, naturalHeight: height } = image;

    const reference = document.createElement("canvas");
    reference.width = width;
    reference.height = height;
    const referenceContext = reference.getContext("2d");
    referenceContext.drawImage(image, 0, 0);
    const expected = referenceContext.getImageData(0, 0, width, height).data;

    const output = await renderImageWithFilters(image, {
      width,
      height,
      ...getExportFilters(DEFAULT_SETTINGS, width, height),
    });
    const actual = output
      .getContext("2d")
      .getImageData(0, 0, output.width, output.height).data;

    let differingBytes = 0;
    for (let i = 0; i < expected.length; i++) {
      if (expected[i] !== actual[i]) differingBytes++;
    }
    return {
      size: { width: output.width, height: output.height },
      sourceSize: { width, height },
      differingBytes,
    };
  }, base64);

  expect(result.size).toEqual(result.sourceSize);
  expect(result.differingBytes).toBe(0);
});
