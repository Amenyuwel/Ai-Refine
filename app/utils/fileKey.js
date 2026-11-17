const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

// Key that is equal for two files with the same content, so a file dropped
// twice (or a renamed copy) is caught. crypto.subtle only exists in secure
// contexts (HTTPS, localhost); elsewhere fall back to the file's identity.
export const getFileKey = async (file) => {
  if (!globalThis.crypto?.subtle) {
    return `${file.name}:${file.size}:${file.lastModified}`;
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer(),
  );
  return toHex(digest);
};
