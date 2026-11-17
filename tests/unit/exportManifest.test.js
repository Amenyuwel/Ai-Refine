import { expect, test } from "vitest";
import JSZip from "jszip";
import {
  MANIFEST_FILE_NAME,
  buildManifest,
  describeOperations,
} from "@/utils/exportManifest";
import { getExportFilters } from "@/utils/filterSettings";
import { buildExportFileNames } from "@/utils/exportFileNames";

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

test("manifest is valid JSON mapping each output to its source", () => {
  const filters = getExportFilters(
    { ...ALL_OFF, grayscale: { enabled: true, value: 100 } },
    40,
    30,
  );
  const manifest = JSON.parse(
    buildManifest([
      { output: "cat.png", source: "cat.jpg", filters },
      { output: "cat_2.png", source: "cat.png", filters },
    ]),
  );
  expect(manifest).toEqual({
    files: [
      {
        output: "cat.png",
        source: "cat.jpg",
        operations: [{ name: "grayscale", percent: 100 }],
      },
      {
        output: "cat_2.png",
        source: "cat.png",
        operations: [{ name: "grayscale", percent: 100 }],
      },
    ],
  });
});

test("ZIP holds one entry per output plus the manifest, and they match", async () => {
  const sources = ["cat.jpg", "cat.png", "dog.jpeg"];
  const outputs = buildExportFileNames(sources, ".png");
  const filters = getExportFilters(ALL_OFF, 40, 30);
  const zip = new JSZip();
  outputs.forEach((output) => zip.file(output, new Uint8Array([1])));
  zip.file(
    MANIFEST_FILE_NAME,
    buildManifest(
      outputs.map((output, index) => ({
        output,
        source: sources[index],
        filters,
      })),
    ),
  );

  const unzipped = await JSZip.loadAsync(
    await zip.generateAsync({ type: "uint8array" }),
  );
  const names = Object.keys(unzipped.files);
  expect(names).toEqual(["cat.png", "cat_2.png", "dog.png", "manifest.json"]);

  const manifest = JSON.parse(
    await unzipped.file(MANIFEST_FILE_NAME).async("string"),
  );
  expect(manifest.files.map(({ output, source }) => [output, source])).toEqual([
    ["cat.png", "cat.jpg"],
    ["cat_2.png", "cat.png"],
    ["dog.png", "dog.jpeg"],
  ]);
  expect(manifest.files.map(({ output }) => output)).toEqual(
    names.filter((name) => name !== MANIFEST_FILE_NAME),
  );
});
