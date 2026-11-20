import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import JSZip from "jszip";

const FIXTURES = path.resolve(__dirname, "../fixtures");
const DUPLICATE_NOTICE = "Skipped images that are already in the list.";
const PNG_SIGNATURE = "89504e470d0a1a0a";

const readFixture = async (
  relativePath,
  name = path.basename(relativePath),
) => ({
  name,
  base64: (await readFile(path.join(FIXTURES, relativePath))).toString(
    "base64",
  ),
});

// Playwright has no file drag from the OS, so build the DataTransfer in the
// page and dispatch the drop the window listener handles.
const dropFiles = async (page, files) => {
  const dataTransfer = await page.evaluateHandle((filesToDrop) => {
    const transfer = new DataTransfer();
    for (const { name, base64 } of filesToDrop) {
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      transfer.items.add(new File([bytes], name, { type: "image/png" }));
    }
    return transfer;
  }, files);
  await page.dispatchEvent("body", "drop", { dataTransfer });
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

  await page.getByRole("button", { name: "DOWNLOAD", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "DOWNLOAD AS ZIP FILE" }).click();
  const download = await downloadPromise;

  const zip = await JSZip.loadAsync(await readFile(await download.path()));
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
