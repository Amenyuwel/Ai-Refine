import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { waitForDropListener } from "./waitForDropListener";

const FIXTURE = path.resolve(__dirname, "../fixtures/cat.png");
const IMAGE_COUNT = 16;
const MIN_GAP = 8;

const SIZES = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
];

const openUpload = async (page, size) => {
  await page.setViewportSize(size);
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
};

// Uploads are deduped by content, so every file needs a different picture.
const addDistinctImages = (page, count) =>
  page.evaluate(async (total) => {
    const transfer = new DataTransfer();
    for (let index = 0; index < total; index += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const context = canvas.getContext("2d");
      context.fillStyle = `hsl(${index * 20}, 70%, 50%)`;
      context.fillRect(0, 0, 32, 32);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      transfer.items.add(
        new File([blob], `swatch-${index}.png`, { type: "image/png" }),
      );
    }
    const input = document.querySelectorAll('input[type="file"]')[1];
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, count);

for (const size of SIZES) {
  test(`thumbnail strip at ${size.width}x${size.height}: gap above scrollbar, padded edges`, async ({
    page,
  }) => {
    await openUpload(page, size);
    await addDistinctImages(page, IMAGE_COUNT);
    const thumbnails = page.locator(
      '[data-tour="image-footer"] section button',
    );
    await expect(thumbnails).toHaveCount(IMAGE_COUNT + 1);

    const scroller = page.locator('[data-tour="image-footer"] section > div');
    const { scrollWidth, clientWidth, scrollbarHeight, bottom } =
      await scroller.evaluate((element) => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        scrollbarHeight: element.offsetHeight - element.clientHeight,
        bottom: element.getBoundingClientRect().bottom,
      }));
    expect(scrollWidth, "strip scrolls horizontally").toBeGreaterThan(
      clientWidth,
    );

    const thumbnailBox = await thumbnails.last().boundingBox();
    const scrollbarTop = bottom - scrollbarHeight;
    expect(
      scrollbarTop - (thumbnailBox.y + thumbnailBox.height),
    ).toBeGreaterThanOrEqual(MIN_GAP);

    const addBox = await page
      .getByRole("button", { name: "Add image" })
      .boundingBox();
    const deleteBox = await page
      .getByRole("button", { name: "Delete selected image" })
      .boundingBox();
    expect(addBox.x).toBeGreaterThanOrEqual(MIN_GAP);
    expect(size.width - (deleteBox.x + deleteBox.width)).toBeGreaterThanOrEqual(
      MIN_GAP,
    );
    expect(addBox.height).toBeCloseTo(thumbnailBox.height, 0);
    expect(deleteBox.height).toBeCloseTo(thumbnailBox.height, 0);

    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBe(size.height);
  });
}

test("add opens the file picker and delete removes the selected image", async ({
  page,
}) => {
  await openUpload(page, SIZES[0]);
  await addDistinctImages(page, 3);
  const thumbnails = page.locator('[data-tour="image-footer"] section button');
  await expect(thumbnails).toHaveCount(4);

  const fileChooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Add image" }).click();
  expect((await fileChooser).isMultiple()).toBe(true);

  await page.getByRole("button", { name: "Delete selected image" }).click();
  await expect(thumbnails).toHaveCount(3);
});
