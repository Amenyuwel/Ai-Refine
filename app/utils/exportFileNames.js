const stripExtension = (fileName) => {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
};

// Output names keep the source base name so they still pair with label files
// (YOLO .txt, Pascal VOC .xml) that match by name. extension includes the dot.
// Collisions get "_2", "_3"... in list order. Names are compared
// case-insensitively because Windows and macOS unzip "A.png" over "a.png".
export const buildExportFileNames = (sourceFileNames, extension) => {
  const baseNames = sourceFileNames.map(stripExtension);
  // Reserve every plain name first, so a source named "cat_2" keeps its name
  // even when an earlier "cat" duplicate would otherwise take it.
  const takenNames = new Set(
    baseNames.map((baseName) => `${baseName}${extension}`.toLowerCase()),
  );
  const usedPlainNames = new Set();

  return baseNames.map((baseName) => {
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
