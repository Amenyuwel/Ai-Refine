// manifest.json inside the exported ZIP: which source each output came from
// and what was applied to it, so a dataset can be audited and reproduced.

export const MANIFEST_FILE_NAME = "manifest.json";

// Lists only operations that change pixels, in the order the export applies
// them: zoom, rotate, flip, then the filters. Flip is listed last; it commutes
// with the filters, but not with rotate, which is why rotate comes before it.
// Rotate includes the scale-up that covers the empty corners
// (getRotationCoverScale), which follows from the angle and the image size.
export const describeOperations = ({
  flip,
  rotateDegrees,
  zoomPercent,
  grayscalePercent,
  blurRadius,
  brightnessPercent,
}) => {
  const operations = [];
  if (zoomPercent > 100) {
    operations.push({ name: "zoom", percent: zoomPercent });
  }
  if (rotateDegrees) {
    operations.push({ name: "rotate", degrees: rotateDegrees });
  }
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

// entries: one { output, source, size, sha256, filters } per file actually
// written to the ZIP; output is the entry's path inside the ZIP, size is its
// length in bytes and sha256 is the source's content hash. className is the
// sanitized class folder, or null for a flat ZIP. No timestamp: the same input
// and settings must give a byte-identical manifest.
export const buildManifest = (entries, appVersion, className) =>
  JSON.stringify(
    {
      appVersion,
      class: className,
      files: entries.map(({ output, source, size, sha256, filters }) => ({
        output,
        source,
        size,
        sha256,
        operations: describeOperations(filters),
      })),
    },
    null,
    2,
  );
