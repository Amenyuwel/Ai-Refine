import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { waitForDropListener } from "./waitForDropListener";

const FIXTURE = path.resolve(__dirname, "../fixtures/cat.png");

const SIZES = [
  { width: 1911, height: 938 },
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
];

const CENTER_TOLERANCE_PX = 2;
const MAX_GAP_PX = 32;

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

const middleOf = (box) => box.x + box.width / 2;

for (const size of SIZES) {
  test(`image and Augment panel are centered as a group at ${size.width}x${size.height}`, async ({
    page,
  }) => {
    await openUpload(page, size);
    // The padded frame is what the user sees as the picture, and what the group centers
    const image = page.getByAltText("Uploaded Preview").locator("xpath=../..");
    const panel = page.getByRole("region", { name: "Augment" });
    const mainMiddle = size.width / 2;

    await expect
      .poll(async () =>
        Math.abs(middleOf(await image.boundingBox()) - mainMiddle),
      )
      .toBeLessThanOrEqual(CENTER_TOLERANCE_PX);

    await page.getByRole("button", { name: "Augment", exact: true }).click();
    await expect(panel).toBeVisible();

    await expect
      .poll(async () => {
        const imageBox = await image.boundingBox();
        const panelBox = await panel.boundingBox();
        const groupMiddle = (imageBox.x + panelBox.x + panelBox.width) / 2;
        return Math.abs(groupMiddle - mainMiddle);
      })
      .toBeLessThanOrEqual(CENTER_TOLERANCE_PX);

    const imageBox = await image.boundingBox();
    const panelBox = await panel.boundingBox();
    const gap = panelBox.x - (imageBox.x + imageBox.width);
    expect(gap).toBeGreaterThan(0);
    expect(gap).toBeLessThanOrEqual(MAX_GAP_PX);

    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollHeight))
      .toBe(size.height);

    await page.getByRole("button", { name: "Augment", exact: true }).click();
    await expect(panel).toHaveCount(0);
    await expect
      .poll(async () =>
        Math.abs(middleOf(await image.boundingBox()) - mainMiddle),
      )
      .toBeLessThanOrEqual(CENTER_TOLERANCE_PX);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollHeight))
      .toBe(size.height);
  });
}
