export const EXAMPLE_NAMES = ["Animal", "Object", "Pest"];

export const exampleImagePath = (name) => `/images/${name}.png`;

// Real File, so a dropped example goes through the same path as an upload
export const fetchExampleFile = async (name) => {
  const imagePath = exampleImagePath(name);
  const response = await fetch(imagePath);
  if (!response.ok)
    throw new Error(`Failed to fetch example image: ${imagePath}`);
  const blob = await response.blob();
  return new File([blob], `${name}.png`, { type: blob.type });
};

// Browsers do not hand a File added in dragstart back to a drop target in the
// same page, so an in-page example drag is marked with this type instead
export const EXAMPLE_DRAG_TYPE = "application/x-example-image";
