import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { waitForDropListener } from "./waitForDropListener";

const FIXTURE = path.resolve(__dirname, "../fixtures/cat.png");

const dropFixture = async (page) => {
  const base64 = (await readFile(FIXTURE)).toString("base64");
  const dataTransfer = await page.evaluateHandle((encoded) => {
    const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], "cat.png", { type: "image/png" }));
    return transfer;
  }, base64);
  await waitForDropListener(page, dataTransfer);
  await page.dispatchEvent("body", "drop", { dataTransfer });
};

const openUpload = async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await dropFixture(page);
  await page.waitForURL("**/upload");
  await expect(page.getByAltText("Uploaded Preview")).toBeVisible();
  // The guided tour overlay starts on arrival and blocks clicks
  await page.keyboard.press("Escape");
  await expect(page.locator(".driver-overlay")).toHaveCount(0);
};

test("canvas is centered with the toolbar below it", async ({ page }) => {
  await openUpload(page);

  const box = await page.getByAltText("Uploaded Preview").boundingBox();
  const viewportWidth = page.viewportSize().width;
  expect(Math.abs(box.x + box.width / 2 - viewportWidth / 2)).toBeLessThan(2);
});

test("image is not cropped and stays inside the size box", async ({ page }) => {
  await openUpload(page);
  const image = page.getByAltText("Uploaded Preview");
  const box = await image.boundingBox();
  const natural = await image.evaluate((img) => ({
    width: img.naturalWidth,
    height: img.naturalHeight,
  }));

  expect(box.width / box.height).toBeCloseTo(natural.width / natural.height, 1);
  expect(box.width).toBeLessThanOrEqual(960 + 1);
  expect(box.height).toBeLessThanOrEqual(Math.min(0.7 * 900, 640) + 1);
  expect(box.width).toBeLessThanOrEqual(natural.width * 2 + 1);
});
