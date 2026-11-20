import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { waitForDropListener } from "./waitForDropListener";

const FIXTURE = path.resolve(__dirname, "../fixtures/cat.png");

const openUpload = async (page, width, height = 800) => {
  await page.setViewportSize({ width, height });
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
  // The tour starts in an effect after the preview paints; Escape before that is lost
  await expect(page.locator(".driver-popover")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".driver-overlay")).toHaveCount(0);
};

const setSlider = (slider, value) =>
  slider.evaluate((input, next) => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    ).set;
    setter.call(input, String(next));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);

test("old side panel and controls buttons are gone", async ({ page }) => {
  await openUpload(page, 1280);
  await expect(
    page.getByRole("button", { name: /hide controls|show controls/i }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "CONTROLS" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "CONTROLS" })).toHaveCount(0);
  for (const name of ["Augment", "Flip", "Undo", "Redo"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  }
  await expect(
    page.getByRole("button", { name: "Adjust", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Effects", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "DOWNLOAD", exact: true }),
  ).toBeVisible();
});

test("Augment opens all three controls, and sliders change the preview filter", async ({
  page,
}) => {
  await openUpload(page, 1280);
  const image = page.getByAltText("Uploaded Preview");
  const augment = page.getByRole("button", { name: "Augment", exact: true });

  await expect(augment).toHaveAttribute("aria-expanded", "false");
  await augment.click();
  await expect(augment).toHaveAttribute("aria-expanded", "true");
  await expect(augment).toHaveAttribute("aria-controls", /.+/);
  for (const label of ["Brightness", "Grayscale", "Blur"]) {
    await expect(page.getByLabel(label, { exact: true })).toBeVisible();
  }

  await page.getByRole("switch", { name: "Enable Brightness" }).click();
  await setSlider(page.getByLabel("Brightness", { exact: true }), 130);
  await expect(image).toHaveCSS("filter", /brightness\(1\.3\)/);
  await page.getByRole("switch", { name: "Enable Grayscale" }).click();
  await setSlider(page.getByLabel("Grayscale", { exact: true }), 60);
  await expect(image).toHaveCSS("filter", /grayscale\(0\.6\)/);
  await page.getByRole("switch", { name: "Enable Blur" }).click();
  await setSlider(page.getByLabel("Blur", { exact: true }), 10);
  await expect(image).toHaveCSS("filter", /blur\((?!0px)/);

  await augment.click();
  await expect(augment).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByLabel("Grayscale", { exact: true })).toHaveCount(0);
  await expect(image).toHaveCSS("filter", /brightness\(1\.3\)/);
});

test("flip toggles the preview", async ({ page }) => {
  await openUpload(page, 1280);
  const image = page.getByAltText("Uploaded Preview");
  const flip = page.getByRole("button", { name: "Flip", exact: true });

  await flip.click();
  await expect(flip).toHaveAttribute("aria-pressed", "true");
  await expect(image).toHaveCSS("transform", "matrix(-1, 0, 0, 1, 0, 0)");
  await flip.click();
  await expect(image).toHaveCSS("transform", "none");
});

test("Augment works from the keyboard", async ({ page }) => {
  await openUpload(page, 1280);
  await page.getByRole("button", { name: "Augment", exact: true }).focus();
  await page.keyboard.press("Enter");
  const slider = page.getByLabel("Brightness", { exact: true });
  await expect(slider).toBeVisible();
  await page.getByRole("switch", { name: "Enable Brightness" }).focus();
  await page.keyboard.press("Space");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("101");
});

const TOOLBAR_BUTTON_NAMES = ["Augment", "Flip", "Undo", "Redo", "DOWNLOAD"];

// main has overflow-x-hidden, so scrollWidth never grows: measure each button instead
const expectButtonsInsidePillAndViewport = async (page, width) => {
  const pill = await page.locator('[data-tour="toolbar"]').boundingBox();
  expect(pill.x).toBeGreaterThanOrEqual(0);
  expect(pill.x + pill.width).toBeLessThanOrEqual(width);

  for (const name of TOOLBAR_BUTTON_NAMES) {
    const box = await page
      .getByRole("button", { name, exact: true })
      .boundingBox();
    expect(box, `${name} button is rendered`).not.toBeNull();
    expect(box.x, `${name} left edge in viewport`).toBeGreaterThanOrEqual(0);
    expect(
      box.x + box.width,
      `${name} right edge in viewport`,
    ).toBeLessThanOrEqual(width);
    expect(box.x, `${name} left edge in pill`).toBeGreaterThanOrEqual(pill.x);
    expect(box.x + box.width, `${name} right edge in pill`).toBeLessThanOrEqual(
      pill.x + pill.width,
    );
    expect(box.y, `${name} top edge in pill`).toBeGreaterThanOrEqual(pill.y);
    expect(
      box.y + box.height,
      `${name} bottom edge in pill`,
    ).toBeLessThanOrEqual(pill.y + pill.height);
  }
};

for (const width of [320, 375, 768, 1280]) {
  test(`toolbar fits at ${width}px: buttons inside pill and viewport, above the image`, async ({
    page,
  }) => {
    await openUpload(page, width);
    await page.getByRole("button", { name: "Augment", exact: true }).click();
    await expectButtonsInsidePillAndViewport(page, width);

    const toolbar = await page.locator('[data-tour="toolbar"]').boundingBox();
    const navbar = await page.locator("header").first().boundingBox();
    const image = await page.getByAltText("Uploaded Preview").boundingBox();
    const footer = await page
      .locator('[data-tour="image-footer"]')
      .boundingBox();
    expect(toolbar.y).toBeGreaterThanOrEqual(navbar.y + navbar.height - 1);
    expect(toolbar.y + toolbar.height).toBeLessThanOrEqual(image.y);
    expect(footer.y + footer.height).toBeLessThanOrEqual(
      page.viewportSize().height + 1,
    );
  });
}

test("closed: image is centered in the viewport", async ({ page }) => {
  await openUpload(page, 1280);
  const image = await page.getByAltText("Uploaded Preview").boundingBox();
  expect(Math.abs(image.x + image.width / 2 - 640)).toBeLessThanOrEqual(2);
});

test("open at 1280px: panel right of image, no overlap", async ({ page }) => {
  await openUpload(page, 1280);
  await page.getByRole("button", { name: "Augment", exact: true }).click();
  const image = await page.getByAltText("Uploaded Preview").boundingBox();
  const panel = await page
    .getByRole("region", { name: "Augment" })
    .boundingBox();

  expect(panel.x).toBeGreaterThanOrEqual(image.x + image.width);
});

test("open at 375px: panel stacks above the image, no horizontal overflow", async ({
  page,
}) => {
  await openUpload(page, 375);
  await page.getByRole("button", { name: "Augment", exact: true }).click();
  const image = await page.getByAltText("Uploaded Preview").boundingBox();
  const panel = await page
    .getByRole("region", { name: "Augment" })
    .boundingBox();

  expect(panel.y + panel.height).toBeLessThanOrEqual(image.y);
  for (const box of [image, panel]) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(375);
  }
  // main hides overflow-x, so also check nothing is clipped off the right edge
  const hiddenWidth = await page.evaluate(
    () => document.querySelector("main").scrollWidth - window.innerWidth,
  );
  expect(hiddenWidth).toBeLessThanOrEqual(0);
});

for (const [width, height] of [
  [320, 568],
  [375, 667],
  [320, 800],
  [375, 800],
]) {
  test(`open at ${width}x${height}: preview stays visible and every control is reachable`, async ({
    page,
  }) => {
    await openUpload(page, width, height);
    await page.getByRole("button", { name: "Augment", exact: true }).click();
    const image = await page.getByAltText("Uploaded Preview").boundingBox();
    expect(image.height).toBeGreaterThan(40);

    // The panel scrolls inside itself, so the last controls can be reached
    for (const name of ["Brightness", "Grayscale", "Blur", "Rotate", "Zoom"]) {
      const slider = page.getByLabel(name, { exact: true });
      await slider.scrollIntoViewIfNeeded();
      await expect(slider).toBeInViewport();
    }
    const reset = page.getByRole("button", { name: "Reset", exact: true });
    await reset.scrollIntoViewIfNeeded();
    await expect(reset).toBeInViewport();
    const hiddenWidth = await page.evaluate(
      () => document.querySelector("main").scrollWidth - window.innerWidth,
    );
    expect(hiddenWidth).toBeLessThanOrEqual(0);
  });
}

test("tour points only at elements that exist", async ({ page }) => {
  await openUpload(page, 1280);
  for (const name of ["toolbar", "image-footer", "download"]) {
    await expect(page.locator(`[data-tour="${name}"]`)).toBeVisible();
  }
  await expect(
    page.locator('[data-tour="controls-panel"], [data-tour="controls-button"]'),
  ).toHaveCount(0);
});

const WHITE = "rgb(255, 255, 255)";
const DARK = "rgb(61, 61, 61)";

test("green toolbar buttons use white text, inactive ones keep dark text", async ({
  page,
}) => {
  await openUpload(page, 1280);
  const augment = page.getByRole("button", { name: "Augment", exact: true });
  const flip = page.getByRole("button", { name: "Flip", exact: true });
  const download = page.getByRole("button", { name: "DOWNLOAD", exact: true });
  const undo = page.getByRole("button", { name: "Undo", exact: true });

  await expect(augment).toHaveCSS("color", DARK);
  await expect(flip).toHaveCSS("color", DARK);
  await expect(undo).toHaveCSS("color", DARK);
  await expect(download).toHaveCSS("color", WHITE);

  await augment.click();
  await flip.click();
  await expect(augment).toHaveCSS("color", WHITE);
  await expect(flip).toHaveCSS("color", WHITE);
  await expect(augment.locator("svg")).toHaveCSS("color", WHITE);

  await augment.click();
  await flip.click();
  await expect(augment).toHaveCSS("color", DARK);
  await expect(flip).toHaveCSS("color", DARK);
});

test("hover scales the green buttons and leaves inactive ones alone", async ({
  page,
}) => {
  await openUpload(page, 1280);
  const download = page.getByRole("button", { name: "DOWNLOAD", exact: true });
  const augment = page.getByRole("button", { name: "Augment", exact: true });

  await expect(download).toHaveCSS("scale", "none");
  await download.hover();
  await expect(download).toHaveCSS("scale", "1.05");

  await augment.hover();
  await expect(augment).toHaveCSS("scale", "none");
  await augment.click();
  await expect(augment).toHaveCSS("scale", "1.05");
});
