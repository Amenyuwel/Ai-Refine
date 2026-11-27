const BYTES_PER_MB = 1024 * 1024;

// Above this the ZIP is not built. QA crashed the tab ("Page crashed") with
// 99 images x 21 files; 211 files of 672 MB still worked.
const MAX_EXPORT_FILES = 500;
// Above either of these the export still runs, with a warning first.
const WARN_EXPORT_FILES = 100;
const WARN_EXPORT_BYTES = 500 * BYTES_PER_MB;

// Each image gives its original plus variantCount variants, and the ZIP adds
// manifest.json. Variants keep the source format, so each one is counted at
// its source's size.
export const estimateExport = (sourceSizes, variantCount) => {
  const filesPerSource = variantCount + 1;
  const sourceBytes = sourceSizes.reduce((total, size) => total + size, 0);
  return {
    fileCount: sourceSizes.length * filesPerSource + 1,
    totalBytes: sourceBytes * filesPerSource,
  };
};

// One decimal under 10 MB, rounded up so a small export never reads "0 MB".
const formatMegabytes = (bytes) => {
  const megabytes = bytes / BYTES_PER_MB;
  if (megabytes < 10) return (Math.ceil(megabytes * 10) / 10).toFixed(1);
  return String(Math.round(megabytes));
};

// null when the export needs no notice. isBlocked means the ZIP must not be
// built; otherwise the message is a warning and the export may go ahead.
export const getExportSizeNotice = ({ fileCount, totalBytes }) => {
  if (fileCount > MAX_EXPORT_FILES) {
    return {
      isBlocked: true,
      message: `Export would create ${fileCount} files (limit ${MAX_EXPORT_FILES}). Lower variants per image or remove images.`,
    };
  }
  if (fileCount > WARN_EXPORT_FILES || totalBytes > WARN_EXPORT_BYTES) {
    return {
      isBlocked: false,
      message: `This export will create ${fileCount} files, about ${formatMegabytes(totalBytes)} MB. Large exports can be slow or crash the tab.`,
    };
  }
  return null;
};
