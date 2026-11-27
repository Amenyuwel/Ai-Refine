const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

// SHA-256 of the file content as hex. crypto.subtle only exists in secure
// contexts (HTTPS, localhost); elsewhere there is no hash and this gives null.
export const getFileSha256 = async (file) => {
  if (!globalThis.crypto?.subtle) return null;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer(),
  );
  return toHex(digest);
};

// Key that is equal for two files with the same content, so a file dropped
// twice (or a renamed copy) is caught. Without a content hash, fall back to
// the file's identity.
export const getFileKey = (file, sha256) =>
  sha256 ?? `${file.name}:${file.size}:${file.lastModified}`;
