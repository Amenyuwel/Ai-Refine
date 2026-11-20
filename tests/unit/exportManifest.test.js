import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import JSZip from "jszip";
import {
  MANIFEST_FILE_NAME,
  buildManifest,
  describeOperations,
} from "@/utils/exportManifest";
import { getExportFilters } from "@/utils/filterSettings";
import {
  buildExportFileNames,
  getExportFormat,
  getZipEntryPath,
} from "@/utils/exportFileNames";
import { getFileSha256 } from "@/utils/fileKey";

const FIXTURES = path.resolve(import.meta.dirname, "../fixtures");
const APP_VERSION = "1.2.3";
const CAT_SHA256 = "a".repeat(64);
const OTHER_CAT_SHA256 = "b".repeat(64);

const ALL_OFF = {
  grayscale: { enabled: false, value: 0 },
  blur: { enabled: false, value: 0 },
  brightness: { enabled: false, value: 100 },
  flip: { enabled: false, value: 1 },
};

const ALL_ON = {
  grayscale: { enabled: true, value: 40 },
  blur: { enabled: true, value: 10 },
  brightness: { enabled: true, value: 120 },
  flip: { enabled: true, value: -1 },
};

test("no operations when every filter is off", () => {
  expect(describeOperations(getExportFilters(ALL_OFF, 400, 300))).toEqual([]);
});

test("enabled filters with no effect are not listed", () => {
  const noEffect = {
    grayscale: { enabled: true, value: 0 },
    blur: { enabled: true, value: 0 },
    brightness: { enabled: true, value: 100 },
    flip: { enabled: false, value: -1 },
  };
  expect(describeOperations(getExportFilters(noEffect, 400, 300))).toEqual([]);
});

test("lists each applied operation with its parameters in render order", () => {
  // Blur 10 is 1% of the shorter side: 300 px gives sigma 3 px.
  expect(describeOperations(getExportFilters(ALL_ON, 400, 300))).toEqual([
    { name: "grayscale", percent: 40 },
    { name: "blur", sigmaPx: 3 },
    { name: "brightness", percent: 120 },
    { name: "flip", direction: "horizontal" },
  ]);
});

test("blur sigma follows each image's own shorter side", () => {
  const [blur] = describeOperations(
    getExportFilters(
      { ...ALL_OFF, blur: { enabled: true, value: 20 } },
      540,
      1000,
    ),
  );
  expect(blur).toEqual({ name: "blur", sigmaPx: 10.8 });
});

const grayscaleFilters = getExportFilters(
  { ...ALL_OFF, grayscale: { enabled: true, value: 100 } },
  40,
  30,
);
const GRAYSCALE_ENTRIES = [
  {
    output: "cat.png",
    source: "cat.jpg",
    size: 1234,
    sha256: CAT_SHA256,
    filters: grayscaleFilters,
  },
  {
    output: "cat_2.png",
    source: "cat.png",
    size: 5678,
    sha256: OTHER_CAT_SHA256,
    filters: grayscaleFilters,
  },
];

test("manifest is valid JSON mapping each output to its source", () => {
  const manifest = JSON.parse(
    buildManifest(GRAYSCALE_ENTRIES, APP_VERSION, null),
  );
  expect(manifest).toEqual({
    appVersion: APP_VERSION,
    class: null,
    files: [
      {
        output: "cat.png",
        source: "cat.jpg",
        size: 1234,
        sha256: CAT_SHA256,
        operations: [{ name: "grayscale", percent: 100 }],
      },
      {
        output: "cat_2.png",
        source: "cat.png",
        size: 5678,
        sha256: OTHER_CAT_SHA256,
        operations: [{ name: "grayscale", percent: 100 }],
      },
    ],
  });
});

test("same input and settings give a byte-identical manifest", () => {
  expect(buildManifest(GRAYSCALE_ENTRIES, APP_VERSION, null)).toBe(
    buildManifest(structuredClone(GRAYSCALE_ENTRIES), APP_VERSION, null),
  );
});

test("source hash is the SHA-256 of the source file", async () => {
  const bytes = await readFile(path.join(FIXTURES, "cat.png"));
  const sha256 = await getFileSha256(new File([bytes], "cat.png"));
  const manifest = JSON.parse(
    buildManifest(
      [
        {
          output: "cat.png",
          source: "cat.png",
          size: bytes.length,
          sha256,
          filters: {},
        },
      ],
      APP_VERSION,
      null,
    ),
  );

  expect(manifest.files[0].sha256).toBe(
    createHash("sha256").update(bytes).digest("hex"),
  );
});

const ZIP_SOURCES = [
  { name: "cat.jpg", type: "image/jpeg" },
  { name: "cat.png", type: "image/png" },
  { name: "cat.png", type: "image/png" },
  { name: "dog.jpeg", type: "image/jpeg" },
];

// Builds the ZIP the way Download.jsx does and reads it back.
const buildAndReadZip = async (className) => {
  const paths = buildExportFileNames(
    ZIP_SOURCES.map((source) => ({
      name: source.name,
      extension: getExportFormat(source).extension,
    })),
  ).map((fileName) => getZipEntryPath(className, fileName));
  const filters = getExportFilters(ALL_OFF, 40, 30);
  // A different length per output, so a size taken from the wrong entry fails.
  const contents = paths.map((_, index) => new Uint8Array(index + 1));
  const zip = new JSZip();
  paths.forEach((zipPath, index) => zip.file(zipPath, contents[index]));
  zip.file(
    MANIFEST_FILE_NAME,
    buildManifest(
      paths.map((output, index) => ({
        output,
        source: ZIP_SOURCES[index].name,
        size: contents[index].length,
        sha256: CAT_SHA256,
        filters,
      })),
      APP_VERSION,
      className,
    ),
  );

  const unzipped = await JSZip.loadAsync(
    await zip.generateAsync({ type: "uint8array" }),
  );
  const manifest = JSON.parse(
    await unzipped.file(MANIFEST_FILE_NAME).async("string"),
  );
  return { unzipped, manifest };
};

const getFileEntryNames = (unzipped) =>
  Object.values(unzipped.files)
    .filter((entry) => !entry.dir)
    .map((entry) => entry.name);

const expectManifestSizesMatchEntries = async (unzipped, manifest) => {
  for (const { output, size } of manifest.files) {
    const entry = await unzipped.file(output).async("uint8array");
    expect(size, output).toBe(entry.length);
  }
};

test("ZIP holds one entry per output plus the manifest, and they match", async () => {
  const { unzipped, manifest } = await buildAndReadZip(null);
  const names = Object.keys(unzipped.files);
  expect(names).toEqual([
    "cat.jpg",
    "cat.png",
    "cat_2.png",
    "dog.jpeg",
    "manifest.json",
  ]);

  expect(manifest.class).toBeNull();
  expect(manifest.files.map(({ output, source }) => [output, source])).toEqual([
    ["cat.jpg", "cat.jpg"],
    ["cat.png", "cat.png"],
    ["cat_2.png", "cat.png"],
    ["dog.jpeg", "dog.jpeg"],
  ]);
  expect(manifest.files.map(({ output }) => output)).toEqual(
    names.filter((name) => name !== MANIFEST_FILE_NAME),
  );
  await expectManifestSizesMatchEntries(unzipped, manifest);
});

test("with a class, every image sits in its folder and the manifest stays at the root", async () => {
  const { unzipped, manifest } = await buildAndReadZip("cat");
  expect(getFileEntryNames(unzipped)).toEqual([
    "cat/cat.jpg",
    "cat/cat.png",
    "cat/cat_2.png",
    "cat/dog.jpeg",
    "manifest.json",
  ]);

  expect(manifest.class).toBe("cat");
  expect(manifest.files.map(({ output, source }) => [output, source])).toEqual([
    ["cat/cat.jpg", "cat.jpg"],
    ["cat/cat.png", "cat.png"],
    ["cat/cat_2.png", "cat.png"],
    ["cat/dog.jpeg", "dog.jpeg"],
  ]);
  await expectManifestSizesMatchEntries(unzipped, manifest);
});

test("a class only adds the folder: same images, names and sizes as a flat ZIP", async () => {
  const flat = await buildAndReadZip(null);
  const withClass = await buildAndReadZip("cat");
  const { class: flatClass, ...flatRest } = flat.manifest;
  const { class: folderClass, ...folderRest } = withClass.manifest;

  expect([flatClass, folderClass]).toEqual([null, "cat"]);
  expect({
    ...folderRest,
    files: folderRest.files.map((file) => ({
      ...file,
      output: file.output.replace(/^cat\//, ""),
    })),
  }).toEqual(flatRest);
});

test("zoom and rotate are listed first with their values", () => {
  const filters = getExportFilters(
    {
      ...ALL_ON,
      rotate: { enabled: true, value: -15 },
      zoom: { enabled: true, value: 130 },
    },
    400,
    300,
  );
  expect(describeOperations(filters)).toEqual([
    { name: "zoom", percent: 130 },
    { name: "rotate", degrees: -15 },
    { name: "grayscale", percent: 40 },
    { name: "blur", sigmaPx: 3 },
    { name: "brightness", percent: 120 },
    { name: "flip", direction: "horizontal" },
  ]);
});

test("rotate 0 and zoom 100 are not listed, even when enabled", () => {
  const filters = getExportFilters(
    {
      ...ALL_OFF,
      rotate: { enabled: true, value: 0 },
      zoom: { enabled: true, value: 100 },
    },
    400,
    300,
  );
  expect(describeOperations(filters)).toEqual([]);
});

test("manifest records each image's own rotate and zoom", () => {
  const rotated = getExportFilters(
    { ...ALL_OFF, rotate: { enabled: true, value: 10 } },
    40,
    30,
  );
  const zoomed = getExportFilters(
    { ...ALL_OFF, zoom: { enabled: true, value: 150 } },
    40,
    30,
  );
  const manifest = JSON.parse(
    buildManifest(
      [
        { ...GRAYSCALE_ENTRIES[0], filters: rotated },
        { ...GRAYSCALE_ENTRIES[1], filters: zoomed },
      ],
      APP_VERSION,
      null,
    ),
  );
  expect(manifest.files.map(({ operations }) => operations)).toEqual([
    [{ name: "rotate", degrees: 10 }],
    [{ name: "zoom", percent: 150 }],
  ]);
});
