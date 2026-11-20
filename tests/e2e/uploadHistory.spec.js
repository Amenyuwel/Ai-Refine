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

test("undo and redo step through filter changes and export uses the current settings", async ({
  page,
}) => {
  await openUpload(page);
  const image = page.getByAltText("Uploaded Preview");
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  const redo = page.getByRole("button", { name: "Redo", exact: true });

  await expect(undo).toBeDisabled();
  await expect(redo).toBeDisabled();

  await page.getByRole("button", { name: "Augment", exact: true }).click();
  await page.getByRole("switch", { name: "Enable Grayscale" }).click();
  await setSlider(page.getByLabel("Grayscale", { exact: true }), 60);
  await page
    .getByLabel("Grayscale", { exact: true })
    .dispatchEvent("pointerup");
  await page.getByRole("switch", { name: "Enable Brightness" }).click();
  await setSlider(page.getByLabel("Brightness", { exact: true }), 130);
  await expect(image).toHaveCSS(
    "filter",
    /grayscale\(0\.6\).*brightness\(1\.3\)/,
  );

  await undo.click();
  await expect(image).toHaveCSS("filter", /brightness\(1\)/);
  await expect(image).toHaveCSS("filter", /grayscale\(0\.6\)/);
  await expect(redo).toBeEnabled();

  // Export reflects the post-undo settings: grayscale only
  await page.getByRole("button", { name: "DOWNLOAD", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "DOWNLOAD AS ZIP FILE" }).click();
  const zip = await JSZip.loadAsync(
    await readFile(await (await downloadPromise).path()),
  );
  const manifest = JSON.parse(await zip.file("manifest.json").async("string"));
  expect(manifest.files[0].operations).toEqual([
    { name: "grayscale", percent: 60 },
  ]);

  await redo.click();
  await expect(image).toHaveCSS("filter", /brightness\(1\.3\)/);

  await undo.click();
  await undo.click();
  await undo.click();
  await undo.click();
  await expect(image).toHaveCSS("filter", "none");
  await expect(undo).toBeDisabled();

  await redo.click();
  await redo.click();
  await expect(image).toHaveCSS("filter", /grayscale\(0\.6\)/);
});
