import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { waitForDropListener } from "./waitForDropListener";
import JSZip from "jszip";

const FIXTURE = path.resolve(__dirname, "../fixtures/cat.png");

const openUpload = async (page) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const base64 = (await readFile(FIXTURE)).toString("base64");
  const dataTransfer = await page.evaluateHandle((encoded) => {
    const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], "cat.png", { type: "image/png" }));
    return transfer;
  }, base64);
  await waitForDropListener(page, dataTransfer);
  await page.dispatchEvent("body", "drop", { dataTransfer });
  await page.waitForURL("**/upload");
  await expect(page.getByAltText("Uploaded Preview")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".driver-overlay")).toHaveCount(0);
  await page.getByRole("button", { name: "Augment", exact: true }).click();
};

const setSlider = (slider, value) =>
  slider.evaluate((input, next) => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    ).set;
    setter.call(input, String(next));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("pointerup", { bubbles: true }));
  }, value);

const enable = async (page, name, value) => {
  await page.getByRole("switch", { name: `Enable ${name}` }).click();
  await setSlider(page.getByLabel(name, { exact: true }), value);
};

// Corner samples sit this far in from the top-left, as a fraction of each side,
// so preview and export read the same spot at different pixel sizes. The
// preview frame has large rounded corners, so the spot must be inside them.
const CORNER_FRACTION = 0.3;

// Decodes the first image in the ZIP in the page and reports its size and a
// pixel near its top-left corner.
const readExportedImage = async (page) => {
  await page.getByRole("button", { name: "DOWNLOAD", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "DOWNLOAD AS ZIP FILE" }).click();
  const zip = await JSZip.loadAsync(
    await readFile(await (await downloadPromise).path()),
  );
  const imageName = Object.keys(zip.files).find((name) => /\.png$/i.test(name));
  const base64 = await zip.file(imageName).async("base64");
  return page.evaluate(
    async ({ encoded, fraction }) => {
      const bytes = Uint8Array.from(atob(encoded), (char) =>
        char.charCodeAt(0),
      );
      const bitmap = await createImageBitmap(new Blob([bytes]));
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d");
      context.drawImage(bitmap, 0, 0);
      return {
        width: bitmap.width,
        height: bitmap.height,
        corner: Array.from(
          context.getImageData(
            Math.round(bitmap.width * fraction),
            Math.round(bitmap.height * fraction),
            1,
            1,
          ).data,
        ),
      };
    },
    { encoded: base64, fraction: CORNER_FRACTION },
  );
};

const readPreviewCorner = async (page, image) => {
  const box = await image.locator("xpath=..").boundingBox();
  const shot = await page.screenshot({ clip: box });
  return page
    .evaluate(
      async ({ encoded, fraction }) => {
        const bytes = Uint8Array.from(atob(encoded), (char) =>
          char.charCodeAt(0),
        );
        const bitmap = await createImageBitmap(new Blob([bytes]));
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext("2d");
        context.drawImage(bitmap, 0, 0);
        const x = Math.round(bitmap.width * fraction);
        const y = Math.round(bitmap.height * fraction);
        return Array.from(context.getImageData(x, y, 1, 1).data);
      },
      { encoded: shot.toString("base64"), fraction: CORNER_FRACTION },
    )
    .then((corner) => ({ box, corner }));
};

test("rotate and zoom sliders have the spec ranges and defaults", async ({
  page,
}) => {
  await openUpload(page);
  const rotate = page.getByLabel("Rotate", { exact: true });
  const zoom = page.getByLabel("Zoom", { exact: true });

  await expect(rotate).toHaveAttribute("min", "-30");
  await expect(rotate).toHaveAttribute("max", "30");
  await expect(rotate).toHaveValue("0");
  await expect(rotate).toBeDisabled();
  await expect(zoom).toHaveAttribute("min", "100");
  await expect(zoom).toHaveAttribute("max", "150");
  await expect(zoom).toHaveValue("100");
  await expect(zoom).toBeDisabled();
});

test("preview with rotate 15 and zoom 120 matches the export", async ({
  page,
}) => {
  await openUpload(page);
  const image = page.getByAltText("Uploaded Preview");
  await enable(page, "Rotate", 15);
  await enable(page, "Zoom", 120);
  await expect(page.getByLabel("Rotate", { exact: true })).toHaveValue("15");

  // rotate(15deg) scale(1.2 × cover scale), which is a matrix
  const matrix = await image.evaluate((img) => getComputedStyle(img).transform);
  const [a, b] = matrix.match(/-?[\d.]+(?=[,)])/g).map(Number);
  expect(Math.atan2(b, a) * (180 / Math.PI)).toBeCloseTo(15, 1);
  expect(Math.hypot(a, b)).toBeGreaterThan(1.2);

  const preview = await readPreviewCorner(page, image);
  const exported = await readExportedImage(page);

  // Same shape: the frame stays the image's aspect ratio, as the export does.
  expect(preview.box.width / preview.box.height).toBeCloseTo(
    exported.width / exported.height,
    1,
  );
  // Both corners are real image content, not the page background behind it.
  expect(preview.corner[3]).toBe(255);
  expect(exported.corner[3]).toBe(255);
  preview.corner.slice(0, 3).forEach((channel, index) => {
    expect(Math.abs(channel - exported.corner[index])).toBeLessThanOrEqual(40);
  });
});

test("undo restores rotate and zoom defaults", async ({ page }) => {
  await openUpload(page);
  const image = page.getByAltText("Uploaded Preview");
  await enable(page, "Rotate", -20);
  await enable(page, "Zoom", 140);
  await expect(image).not.toHaveCSS("transform", "none");

  const undo = page.getByRole("button", { name: "Undo", exact: true });
  while (await undo.isEnabled()) await undo.click();

  await expect(page.getByLabel("Rotate", { exact: true })).toHaveValue("0");
  await expect(page.getByLabel("Zoom", { exact: true })).toHaveValue("100");
  await expect(
    page.getByRole("switch", { name: "Enable Rotate" }),
  ).toHaveAttribute("aria-checked", "false");
  // No transform at all: an identity one would still force a separate layer
  await expect(image).toHaveCSS("transform", "none");
});
