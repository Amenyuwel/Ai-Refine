import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { waitForDropListener } from "./waitForDropListener";

const FIXTURE = path.resolve(__dirname, "../fixtures/cat.png");
const TOUR_PARTS = [
  ".driver-popover-title",
  ".driver-popover-description",
  ".driver-popover-progress-text",
  ".driver-popover-close-btn",
  ".driver-popover-prev-btn",
  ".driver-popover-next-btn",
];

const startTour = async (page) => {
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
  await expect(page.locator(".driver-popover")).toBeVisible();
};

test("tour popover uses the project font on every step", async ({ page }) => {
  await startTour(page);
  for (let step = 0; step < 3; step += 1) {
    // Next rebuilds the popover, and a detached node computes an empty font
    await expect(page.locator(".driver-popover-progress-text")).toHaveText(
      `${step + 1} of 3`,
    );
    for (const selector of TOUR_PARTS) {
      const fontFamily = await page
        .locator(selector)
        .evaluate((element) => getComputedStyle(element).fontFamily);
      expect(fontFamily, `${selector} on step ${step + 1}`).toContain(
        "Poppins",
      );
    }
    if (step < 2) await page.locator(".driver-popover-next-btn").click();
  }
});
