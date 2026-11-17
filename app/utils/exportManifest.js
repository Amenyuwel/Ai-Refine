// manifest.json inside the exported ZIP: which source each output came from
// and what was applied to it, so a dataset can be audited and reproduced.

export const MANIFEST_FILE_NAME = "manifest.json";

// Lists only operations that change pixels, in the order the preview applies
// them. Flip is listed last; it commutes with these filters.
export const describeOperations = ({
  flip,
  grayscalePercent,
  blurRadius,
  brightnessPercent,
}) => {
  const operations = [];
  if (grayscalePercent > 0) {
    operations.push({ name: "grayscale", percent: grayscalePercent });
  }
  if (blurRadius > 0) operations.push({ name: "blur", sigmaPx: blurRadius });
  if (brightnessPercent !== 100) {
    operations.push({ name: "brightness", percent: brightnessPercent });
  }
  if (flip) operations.push({ name: "flip", direction: "horizontal" });
  return operations;
};

// entries: one { output, source, filters } per file actually written to the ZIP.
export const buildManifest = (entries) =>
  JSON.stringify(
    {
      files: entries.map(({ output, source, filters }) => ({
        output,
        source,
        operations: describeOperations(filters),
      })),
    },
    null,
    2,
  );
