import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { waitForDropListener } from "./waitForDropListener";
import JSZip from "jszip";

const FIXTURES = path.resolve(__dirname, "../fixtures");
const DUPLICATE_NOTICE = "Skipped images that are already in the list.";
const PNG_SIGNATURE = "89504e470d0a1a0a";
const JPEG_SIGNATURE = "ffd8ff";

const readFixture = async (
  relativePath,
  name = path.basename(relativePath),
  type = "image/png",
) => ({
  name,
  type,
  base64: (await readFile(path.join(FIXTURES, relativePath))).toString(
    "base64",
  ),
});

// Playwright has no file drag from the OS, so build the DataTransfer in the
// page and dispatch the drop the window listener handles.
const dropFiles = async (page, files) => {
  const dataTransfer = await page.evaluateHandle((filesToDrop) => {
    const transfer = new DataTransfer();
    for (const { name, type, base64 } of filesToDrop) {
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      transfer.items.add(new File([bytes], name, { type }));
    }
    return transfer;
  }, files);
  await waitForDropListener(page, dataTransfer);
  await page.dispatchEvent("body", "drop", { dataTransfer });
};

const downloadZip = async (page) => {
  await page.getByRole("button", { name: "DOWNLOAD", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "DOWNLOAD AS ZIP FILE" }).click();
  const download = await downloadPromise;
  return JSZip.loadAsync(await readFile(await download.path()));
};

// Width and height sit at bytes 16-23 of the IHDR chunk, big-endian.
const readPngInfo = (bytes) => {
  const view = Buffer.from(bytes);
  return {
    signature: view.subarray(0, 8).toString("hex"),
    width: view.readUInt32BE(16),
    height: view.readUInt32BE(20),
  };
};

test("duplicates are skipped and the ZIP keeps source names", async ({
  page,
}) => {
  const cat = await readFixture("cat.png");
  const otherCat = await readFixture("other-folder/cat.png");
  const dog = await readFixture("dog.png");
  const renamedDog = await readFixture("dog.png", "dog copy.png");
  const thumbnails = page.getByRole("img", { name: /^Uploaded Image/ });

  await page.goto("/");
  await dropFiles(page, [cat]);
  await page.waitForURL("**/upload");
  await expect(thumbnails).toHaveCount(1);

  // The upload page starts a tour whose overlay would block the clicks below.
  await expect(page.locator(".driver-popover")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".driver-popover")).toBeHidden();

  await dropFiles(page, [cat]);
  await expect(page.getByText(DUPLICATE_NOTICE)).toBeVisible();
  await expect(thumbnails).toHaveCount(1);

  await dropFiles(page, [otherCat, dog, renamedDog, cat]);
  await expect(thumbnails).toHaveCount(3);

  const zip = await downloadZip(page);
  const imageEntries = Object.keys(zip.files).filter((name) =>
    name.endsWith(".png"),
  );
  expect(imageEntries.sort()).toEqual(["cat.png", "cat_2.png", "dog.png"]);

  const expectedSizes = {
    "cat.png": { width: 40, height: 30 },
    "cat_2.png": { width: 406, height: 614 },
    "dog.png": { width: 540, height: 462 },
  };
  for (const [name, size] of Object.entries(expectedSizes)) {
    const info = readPngInfo(await zip.file(name).async("uint8array"));
    expect(info, name).toEqual({ signature: PNG_SIGNATURE, ...size });
  }
});

test("each ZIP entry keeps its source format and extension", async ({
  page,
}) => {
  const jpeg = await readFixture("sample.jpg", "sample.jpg", "image/jpeg");
  const png = await readFixture("sample.png");
  const thumbnails = page.getByRole("img", { name: /^Uploaded Image/ });

  // The encoded bytes do not state their quality, so record what the export
  // asks the canvas for.
  await page.addInitScript(() => {
    window.toBlobCalls = [];
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
      window.toBlobCalls.push({ type, quality });
      return originalToBlob.call(this, callback, type, quality);
    };
  });
  await page.goto("/");
  await dropFiles(page, [jpeg, png]);
  await page.waitForURL("**/upload");
  await expect(thumbnails).toHaveCount(2);

  await expect(page.locator(".driver-popover")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".driver-popover")).toBeHidden();

  const zip = await downloadZip(page);
  const imageEntries = Object.keys(zip.files).filter(
    (name) => name !== "manifest.json",
  );
  expect(imageEntries.sort()).toEqual(["sample.jpg", "sample.png"]);

  const readSignature = async (name, length) =>
    Buffer.from(await zip.file(name).async("uint8array"))
      .subarray(0, length)
      .toString("hex");
  expect(await readSignature("sample.jpg", 3)).toBe(JPEG_SIGNATURE);
  expect(await readSignature("sample.png", 8)).toBe(PNG_SIGNATURE);

  const toBlobCalls = await page.evaluate(() => window.toBlobCalls);
  expect(toBlobCalls.filter(({ type }) => type === "image/jpeg")).toEqual([
    { type: "image/jpeg", quality: 0.95 },
  ]);

  const manifest = JSON.parse(await zip.file("manifest.json").async("string"));
  expect(
    manifest.files.map(({ output, source }) => [output, source]).sort(),
  ).toEqual([
    ["sample.jpg", "sample.jpg"],
    ["sample.png", "sample.png"],
  ]);
});

test("manifest size is each ZIP entry's byte length and repeats across exports", async ({
  page,
}) => {
  const jpeg = await readFixture("sample.jpg", "sample.jpg", "image/jpeg");
  const png = await readFixture("sample.png");
  const thumbnails = page.getByRole("img", { name: /^Uploaded Image/ });

  await page.goto("/");
  await dropFiles(page, [jpeg, png]);
  await page.waitForURL("**/upload");
  await expect(thumbnails).toHaveCount(2);

  await expect(page.locator(".driver-popover")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".driver-popover")).toBeHidden();

  const zip = await downloadZip(page);
  const manifestText = await zip.file("manifest.json").async("string");
  const { files } = JSON.parse(manifestText);
  expect(files).toHaveLength(2);
  for (const { output, size } of files) {
    const entry = await zip.file(output).async("uint8array");
    expect(size, output).toBe(entry.length);
  }

  const secondZip = await downloadZip(page);
  expect(await secondZip.file("manifest.json").async("string")).toBe(
    manifestText,
  );
});
