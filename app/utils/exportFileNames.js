import { ACCEPTED_IMAGE_TYPES } from "@/utils/imageTypes";

const splitExtension = (fileName) => {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex <= 0) return { baseName: fileName, extension: "" };
  return {
    baseName: fileName.slice(0, dotIndex),
    extension: fileName.slice(dotIndex),
  };
};

// Exports keep the source format. file.type is always an accepted type here:
// every upload path filters with isAcceptedImageFile. The source extension is
// kept as written ("photo.JPEG" stays .JPEG) when it matches that format.
export const getExportFormat = (file) => {
  const formatExtensions = ACCEPTED_IMAGE_TYPES[file.type];
  const { extension } = splitExtension(file.name);
  const keepsSourceExtension = formatExtensions.includes(
    extension.toLowerCase(),
  );
  return {
    mimeType: file.type,
    extension: keepsSourceExtension ? extension : formatExtensions[0],
  };
};

// Output names keep the source base name so they still pair with label files
// (YOLO .txt, Pascal VOC .xml) that match by name. Each source is
// { name, extension }, where extension is the output one and includes the dot.
// Collisions get "_2", "_3"... in list order. Names are compared
// case-insensitively because Windows and macOS unzip "A.png" over "a.png".
export const buildExportFileNames = (sources) => {
  const outputs = sources.map(({ name, extension }) => ({
    baseName: splitExtension(name).baseName,
    extension,
  }));
  // Reserve every plain name first, so a source named "cat_2" keeps its name
  // even when an earlier "cat" duplicate would otherwise take it.
  const takenNames = new Set(
    outputs.map(({ baseName, extension }) =>
      `${baseName}${extension}`.toLowerCase(),
    ),
  );
  const usedPlainNames = new Set();

  return outputs.map(({ baseName, extension }) => {
    const plainName = `${baseName}${extension}`;
    if (!usedPlainNames.has(plainName.toLowerCase())) {
      usedPlainNames.add(plainName.toLowerCase());
      return plainName;
    }

    let suffix = 2;
    let candidate = `${baseName}_${suffix}${extension}`;
    while (takenNames.has(candidate.toLowerCase())) {
      suffix += 1;
      candidate = `${baseName}_${suffix}${extension}`;
    }
    takenNames.add(candidate.toLowerCase());
    return candidate;
  });
};

// "cat.png", 1 gives "cat_aug01.png". The number is padded to two digits, or
// to the digits of variantCount when that is longer (aug001 to aug100), so a
// plain name sort keeps variants in order. Below 100 variants the names stay
// two digits, as exports named them before 100 was allowed.
const getVariantFileName = (fileName, variant, variantCount) => {
  const { baseName, extension } = splitExtension(fileName);
  const digits = Math.max(2, String(variantCount).length);
  return `${baseName}_aug${String(variant).padStart(digits, "0")}${extension}`;
};

// One array per source: [original, variant 1, ..., variant variantCount].
// Originals get exactly the names buildExportFileNames gives them, and each
// variant is named after its own original. A variant that would take another
// image's name (a source named "cat_aug01.png" next to "cat.png") gets the
// same "_2", "_3"... suffix as any other collision.
const buildVariantFileNames = (sources, variantCount) => {
  const originalNames = buildExportFileNames(sources);
  const variantNames = originalNames.flatMap((originalName) =>
    Array.from({ length: variantCount }, (_, index) =>
      getVariantFileName(originalName, index + 1, variantCount),
    ),
  );
  // Originals come first and are already unique, so they keep their names.
  const uniqueNames = buildExportFileNames(
    [...originalNames, ...variantNames].map((name) => ({
      name,
      extension: splitExtension(name).extension,
    })),
  );
  const uniqueVariantNames = uniqueNames.slice(originalNames.length);
  return originalNames.map((originalName, sourceIndex) => [
    originalName,
    ...uniqueVariantNames.slice(
      sourceIndex * variantCount,
      (sourceIndex + 1) * variantCount,
    ),
  ]);
};

// Unsafe on at least one OS, or a path separator: / \ : * ? " < > | and
// control characters (U+0000 to U+001F, U+007F).
const UNSAFE_FOLDER_CHARACTERS = /[/\\:*?"<>|\u0000-\u001f\u007f]/g;
export const MAX_CLASS_NAME_LENGTH = 64;

// The class is a single folder name in the ZIP. Separators become "_" and
// leading dots are dropped, so "../x" or "a/b" can never make a parent or
// nested path. Returns null when nothing usable is left: no class folder.
export const sanitizeClassName = (rawName) => {
  const cleaned = rawName
    .trim()
    .replace(UNSAFE_FOLDER_CHARACTERS, "_")
    .replace(/\s+/g, " ")
    .replace(/^\.+/, "");
  // Array.from counts code points, so an emoji is never cut in half.
  const truncated = Array.from(cleaned)
    .slice(0, MAX_CLASS_NAME_LENGTH)
    .join("")
    .trim();
  return truncated || null;
};

// className is the output of sanitizeClassName.
export const getZipEntryPath = (className, fileName) =>
  className ? `${className}/${fileName}` : fileName;

// The files the ZIP holds, one array per source: its original (variant 0),
// then variants 1..variantCount.
export const planExportFiles = (sources, className, variantCount) =>
  buildVariantFileNames(sources, variantCount).map((fileNames) =>
    fileNames.map((fileName, variant) => ({
      variant,
      path: getZipEntryPath(className, fileName),
    })),
  );
