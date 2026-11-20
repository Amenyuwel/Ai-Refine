import { expect, test } from "vitest";
import {
  buildExportFileNames,
  getExportFormat,
  getZipEntryPath,
  sanitizeClassName,
} from "@/utils/exportFileNames";

const asPng = (name) => ({ name, extension: ".png" });

test("a JPEG source exports as JPEG with its own extension", () => {
  expect(getExportFormat({ name: "cat.jpg", type: "image/jpeg" })).toEqual({
    mimeType: "image/jpeg",
    extension: ".jpg",
  });
  expect(getExportFormat({ name: "cat.jpeg", type: "image/jpeg" })).toEqual({
    mimeType: "image/jpeg",
    extension: ".jpeg",
  });
});

test("a PNG source exports as PNG", () => {
  expect(getExportFormat({ name: "cat.png", type: "image/png" })).toEqual({
    mimeType: "image/png",
    extension: ".png",
  });
});

test("keeps the case of the source extension", () => {
  expect(getExportFormat({ name: "cat.JPG", type: "image/jpeg" })).toEqual({
    mimeType: "image/jpeg",
    extension: ".JPG",
  });
});

test("uses the format's own extension when the source has none or another", () => {
  expect(getExportFormat({ name: "scan", type: "image/jpeg" }).extension).toBe(
    ".jpg",
  );
  expect(
    getExportFormat({ name: "photo.webp", type: "image/png" }).extension,
  ).toBe(".png");
});

test("keeps each source base name with its own extension", () => {
  expect(
    buildExportFileNames([
      { name: "cat.jpg", extension: ".jpg" },
      { name: "dog.png", extension: ".png" },
      { name: "bird.jpeg", extension: ".jpeg" },
    ]),
  ).toEqual(["cat.jpg", "dog.png", "bird.jpeg"]);
});

test("a JPEG and a PNG with the same base name do not collide", () => {
  expect(
    buildExportFileNames([
      { name: "sample.jpg", extension: ".jpg" },
      { name: "sample.png", extension: ".png" },
    ]),
  ).toEqual(["sample.jpg", "sample.png"]);
});

test("keeps dots inside the base name and names without an extension", () => {
  expect(
    buildExportFileNames(
      ["my.holiday.photo.png", "scan", ".hidden"].map(asPng),
    ),
  ).toEqual(["my.holiday.photo.png", "scan.png", ".hidden.png"]);
});

test("numbers same-format collisions from _2 in list order", () => {
  expect(
    buildExportFileNames([
      { name: "cat.png", extension: ".png" },
      { name: "cat.png", extension: ".png" },
      { name: "cat.jpg", extension: ".jpg" },
      { name: "cat.jpg", extension: ".jpg" },
      { name: "cat.png", extension: ".png" },
    ]),
  ).toEqual(["cat.png", "cat_2.png", "cat.jpg", "cat_2.jpg", "cat_3.png"]);
});

test("treats names that differ only in case as a collision", () => {
  expect(
    buildExportFileNames([
      { name: "Cat.JPG", extension: ".JPG" },
      { name: "cat.jpg", extension: ".jpg" },
    ]),
  ).toEqual(["Cat.JPG", "cat_2.jpg"]);
});

test("a source already named cat_2 keeps its name", () => {
  expect(
    buildExportFileNames(["cat.png", "cat.png", "cat_2.png"].map(asPng)),
  ).toEqual(["cat.png", "cat_3.png", "cat_2.png"]);
});

test("every output name is unique", () => {
  const outputs = buildExportFileNames([
    { name: "a.png", extension: ".png" },
    { name: "a.jpg", extension: ".jpg" },
    { name: "A.PNG", extension: ".PNG" },
    { name: "a_2.png", extension: ".png" },
    { name: "a_3.jpg", extension: ".jpg" },
    { name: "a.jpg", extension: ".jpg" },
  ]);
  const lowerCased = outputs.map((name) => name.toLowerCase());
  expect(new Set(lowerCased).size).toBe(outputs.length);
});

test("a plain class name is kept as typed, apart from outer spaces", () => {
  expect(sanitizeClassName("cat")).toBe("cat");
  expect(sanitizeClassName("  Golden Retriever  ")).toBe("Golden Retriever");
});

test("an empty or blank class means no class", () => {
  expect(sanitizeClassName("")).toBeNull();
  expect(sanitizeClassName("   ")).toBeNull();
});

test("path separators and characters unsafe on Windows become _", () => {
  expect(sanitizeClassName("a/b")).toBe("a_b");
  expect(sanitizeClassName("a\\b")).toBe("a_b");
  expect(sanitizeClassName('x:*?"<>|y')).toBe("x_______y");
});

test("control characters become _", () => {
  expect(sanitizeClassName("a\tb\nc\u0000d\u007fe")).toBe("a_b_c_d_e");
});

test("runs of spaces collapse to one", () => {
  expect(sanitizeClassName("big    dog")).toBe("big dog");
});

test("leading dots are removed, so the class cannot point to a parent", () => {
  expect(sanitizeClassName("../x")).toBe("_x");
  expect(sanitizeClassName(".hidden")).toBe("hidden");
  expect(sanitizeClassName(" . x")).toBe("x");
  expect(sanitizeClassName("..")).toBeNull();
  expect(sanitizeClassName("...")).toBeNull();
});

test("keeps dots after the first character", () => {
  expect(sanitizeClassName("v1.2")).toBe("v1.2");
});

test("cuts the class to 64 characters without splitting an emoji", () => {
  expect(sanitizeClassName("a".repeat(100))).toBe("a".repeat(64));
  expect(sanitizeClassName("🐱".repeat(70))).toBe("🐱".repeat(64));
  expect(sanitizeClassName(`${"a".repeat(63)} b`)).toBe("a".repeat(63));
});

test("unsafe input never yields a nested or parent ZIP path", () => {
  const unsafeInputs = ["../x", "a/b", "..\\..\\etc", "/abs", "C:\\x", ".."];
  for (const input of unsafeInputs) {
    const zipPath = getZipEntryPath(sanitizeClassName(input), "cat.png");
    const segments = zipPath.split("/");
    expect(segments.length, input).toBeLessThanOrEqual(2);
    expect(segments.at(-1), input).toBe("cat.png");
    expect(segments[0].startsWith("."), input).toBe(false);
  }
});

test("zip path puts the file in the class folder, or at the root without one", () => {
  expect(getZipEntryPath("cat", "cat_2.png")).toBe("cat/cat_2.png");
  expect(getZipEntryPath(null, "cat_2.png")).toBe("cat_2.png");
});
