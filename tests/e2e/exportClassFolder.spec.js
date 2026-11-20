import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { waitForDropListener } from "./waitForDropListener";
import JSZip from "jszip";

const FIXTURES = path.resolve(__dirname, "../fixtures");
const MANIFEST = "manifest.json";

const readFixture = async (name) => ({
  name,
  type: "image/png",
  base64: (await readFile(path.join(FIXTURES, name))).toString("base64"),
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

const openUploadPage = async (page) => {
  await page.goto("/");
  await dropFiles(page, [
    await readFixture("cat.png"),
    await readFixture("dog.png"),
  ]);
  await page.waitForURL("**/upload");
  await expect(page.getByRole("img", { name: /^Uploaded Image/ })).toHaveCount(
    2,
  );

  // The upload page starts a tour whose overlay would block the clicks below.
  await expect(page.locator(".driver-popover")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".driver-popover")).toBeHidden();
};

const setClassName = async (page, className) => {
  const field = page.getByLabel("Class name");
  if (!(await field.isVisible())) {
    await page.getByRole("button", { name: "Augment" }).click();
  }
  await field.fill(className);
};

const downloadZip = async (page) => {
  await page.getByRole("button", { name: "DOWNLOAD", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "DOWNLOAD AS ZIP FILE" }).click();
  const download = await downloadPromise;
  return JSZip.loadAsync(await readFile(await download.path()));
};

const getFileEntryNames = (zip) =>
  Object.values(zip.files)
    .filter((entry) => !entry.dir)
    .map((entry) => entry.name)
    .sort();

const readManifest = async (zip) =>
  JSON.parse(await zip.file(MANIFEST).async("string"));

const readEntrySizes = async (zip, names) =>
  Promise.all(
    names.map(
      async (name) => (await zip.file(name).async("uint8array")).length,
    ),
  );

test("without a class the ZIP stays flat and the manifest class is null", async ({
  page,
}) => {
  await openUploadPage(page);
  const zip = await downloadZip(page);

  expect(Object.keys(zip.files).sort()).toEqual([
    "cat.png",
    "dog.png",
    MANIFEST,
  ]);
  const manifest = await readManifest(zip);
  expect(manifest.class).toBeNull();
  expect(manifest.files.map(({ output }) => output).sort()).toEqual([
    "cat.png",
    "dog.png",
  ]);
});

test('class "cat" puts every image in cat/ and keeps image count and sizes', async ({
  page,
}) => {
  await openUploadPage(page);
  const flatZip = await downloadZip(page);
  await setClassName(page, "cat");
  const classZip = await downloadZip(page);

  expect(getFileEntryNames(classZip)).toEqual([
    "cat/cat.png",
    "cat/dog.png",
    MANIFEST,
  ]);
  const manifest = await readManifest(classZip);
  expect(manifest.class).toBe("cat");
  expect(
    manifest.files.map(({ output, source }) => [output, source]).sort(),
  ).toEqual([
    ["cat/cat.png", "cat.png"],
    ["cat/dog.png", "dog.png"],
  ]);
  for (const { output, size } of manifest.files) {
    const entry = await classZip.file(output).async("uint8array");
    expect(size, output).toBe(entry.length);
  }
  expect(
    await readEntrySizes(classZip, ["cat/cat.png", "cat/dog.png"]),
  ).toEqual(await readEntrySizes(flatZip, ["cat.png", "dog.png"]));
});

test("an unsafe class cannot create nested or parent paths", async ({
  page,
}) => {
  await openUploadPage(page);

  for (const [input, folder] of [
    ["../x", "_x"],
    ["a/b", "a_b"],
  ]) {
    await setClassName(page, input);
    const zip = await downloadZip(page);
    expect(getFileEntryNames(zip), input).toEqual([
      `${folder}/cat.png`,
      `${folder}/dog.png`,
      MANIFEST,
    ]);
    expect((await readManifest(zip)).class, input).toBe(folder);
  }
});

test("the Class name field shows the cleaned folder name and caps length", async ({
  page,
}) => {
  await openUploadPage(page);
  await page.getByRole("button", { name: "Augment" }).click();
  const field = page.getByLabel("Class name");
  await expect(
    page.getByText(
      "Optional. Images go in a folder with this name in the zip.",
    ),
  ).toBeVisible();
  await expect(field).toHaveAttribute("maxlength", "64");

  await field.fill("cat");
  await expect(page.getByText("Folder name:")).toHaveCount(0);
  await field.fill("a/b");
  await expect(page.getByText("Folder name:")).toContainText("a_b");
});

test("the Class name field is usable at a narrow stacked width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await openUploadPage(page);
  await setClassName(page, "cat");
  await expect(page.getByLabel("Class name")).toBeInViewport();
  const zip = await downloadZip(page);
  expect(getFileEntryNames(zip)).toEqual([
    "cat/cat.png",
    "cat/dog.png",
    MANIFEST,
  ]);
});
