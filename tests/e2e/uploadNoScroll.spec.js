import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { waitForDropListener } from "./waitForDropListener";

const FIXTURE = path.resolve(__dirname, "../fixtures/cat.png");

const EXTRA_FIXTURES = ["dog.png", "sample.jpg", "sample.png"].map((name) =>
  path.resolve(__dirname, "../fixtures", name),
);

const SIZES = [
  { width: 1884, height: 922 },
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

// Elements that scroll vertically: overflow auto/scroll with content taller than the box.
// The Augment panel is allowed to: on short screens it scrolls inside itself so the image keeps room.
const findScrollableElements = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("*")]
      .filter((element) => {
        if (element.getAttribute("aria-label") === "Augment") return false;
        const { overflowY } = getComputedStyle(element);
        const canScroll = overflowY === "auto" || overflowY === "scroll";
        return canScroll && element.scrollHeight > element.clientHeight;
      })
      .map((element) => element.tagName + "." + element.className),
  );

const expectNothingScrolls = async (page, height) => {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollHeight))
    .toBe(height);
  expect(await findScrollableElements(page)).toEqual([]);
};

const expectPreviewInsideMainArea = async (page) => {
  const preview = await page.getByAltText("Uploaded Preview").boundingBox();
  const footer = await page.locator('[data-tour="image-footer"]').boundingBox();
  expect(preview.height).toBeGreaterThan(0);
  expect(preview.y + preview.height).toBeLessThanOrEqual(footer.y);
};

for (const size of SIZES) {
  for (const imageCount of [1, 4]) {
    test(`upload page never scrolls at ${size.width}x${size.height} with ${imageCount} image(s)`, async ({
      page,
    }) => {
      await openUpload(page, size);
      if (imageCount > 1) {
        const extraImages = EXTRA_FIXTURES.slice(0, imageCount - 1);
        await page
          .locator('input[type="file"]')
          .nth(1)
          .setInputFiles(extraImages);
      }
      await expectNothingScrolls(page, size.height);
      await expectPreviewInsideMainArea(page);

      await page.getByRole("button", { name: "Augment", exact: true }).click();
      await expect(page.getByRole("region", { name: "Augment" })).toBeVisible();
      await expectNothingScrolls(page, size.height);
      await expectPreviewInsideMainArea(page);

      await expect(
        page.getByRole("button", { name: "Delete selected image" }),
      ).toBeInViewport();
      await expect(page.locator('[data-tour="image-footer"]')).toBeInViewport();
      await expect(page.locator('[data-tour="toolbar"]')).toBeInViewport();
    });
  }
}

test("at 390x844 the Augment panel scrolls inside itself and Class name is usable", async ({
  page,
}) => {
  await openUpload(page, { width: 390, height: 844 });
  await page.getByRole("button", { name: "Augment", exact: true }).click();
  const panel = page.getByRole("region", { name: "Augment" });
  await expect(panel).toBeVisible();

  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);

  const classField = page.getByLabel("Class name");
  await classField.scrollIntoViewIfNeeded();
  await classField.fill("cats");
  await expect(classField).toHaveValue("cats");
  await expect(classField).toBeInViewport();
  await expectPreviewInsideMainArea(page);
  const preview = await page.getByAltText("Uploaded Preview").boundingBox();
  expect(preview.x).toBeGreaterThanOrEqual(0);
  expect(preview.x + preview.width).toBeLessThanOrEqual(390);
});
