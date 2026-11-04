// Set NEXT_PUBLIC_SITE_URL in production; the fallback only serves local development.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:6969";

export const siteName = "AI-Refine";
export const siteDescription =
  "Augment your images in the browser. Flip, blur, adjust brightness and convert to grayscale, then download the results for your machine learning datasets.";
