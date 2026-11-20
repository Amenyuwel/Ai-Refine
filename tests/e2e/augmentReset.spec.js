import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { waitForDropListener } from "./waitForDropListener";

const FIXTURE = path.resolve(__dirname, "../fixtures/cat.png");

const openUpload = async (page, width) => {
  await page.setViewportSize({ width, height: 900 });
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

for (const width of [1280, 375]) {
  test(`Reset restores defaults in one undoable step at ${width}px`, async ({
    page,
  }) => {
    await openUpload(page, width);
    const image = page.getByAltText("Uploaded Preview");
    const undo = page.getByRole("button", { name: "Undo", exact: true });
    await page.getByRole("button", { name: "Augment", exact: true }).click();
    const reset = page.getByRole("button", { name: "Reset", exact: true });
    await expect(reset).toBeDisabled();

    const untouchedFilter = await image.evaluate((el) => el.style.filter);
    const untouchedTransform = await image.evaluate((el) => el.style.transform);

    await page.getByRole("button", { name: "Flip", exact: true }).click();
    await page.getByRole("switch", { name: "Enable Grayscale" }).click();
    await setSlider(page.getByLabel("Grayscale", { exact: true }), 60);
    await page.getByRole("switch", { name: "Enable Brightness" }).click();
    await setSlider(page.getByLabel("Brightness", { exact: true }), 130);
    await page.getByRole("switch", { name: "Enable Zoom" }).click();
    await setSlider(page.getByLabel("Zoom", { exact: true }), 130);
    await expect(image).toHaveCSS(
      "filter",
      /grayscale\(0\.6\).*brightness\(1\.3\)/,
    );
    await expect(reset).toBeEnabled();

    await reset.click();
    await expect(reset).toBeDisabled();
    await expect(image).toHaveCSS("filter", "none");
    expect(await image.evaluate((el) => el.style.filter)).toBe(untouchedFilter);
    expect(await image.evaluate((el) => el.style.transform)).toBe(
      untouchedTransform,
    );

    // Reset kept the history: one Undo brings every earlier setting back
    await undo.click();
    await expect(image).toHaveCSS(
      "filter",
      /grayscale\(0\.6\).*brightness\(1\.3\)/,
    );
    await expect(reset).toBeEnabled();
  });
}
