// Single source of truth for the image formats the app accepts.
export const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

// Value for an <input accept> attribute
export const ACCEPTED_IMAGE_INPUT_ACCEPT = Object.entries(ACCEPTED_IMAGE_TYPES)
  .flatMap(([mimeType, extensions]) => [mimeType, ...extensions])
  .join(",");

export const INVALID_IMAGE_FORMAT_MESSAGE = "Invalid image format.";

export const isAcceptedImageFile = (file) =>
  Object.hasOwn(ACCEPTED_IMAGE_TYPES, file.type);
