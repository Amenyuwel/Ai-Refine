import { siteName } from "./siteConfig";

const socialImage = "/images/Mutant.png";
const socialImageAlt = "Image augmented into several variations";

// Next.js replaces a child's openGraph/twitter objects instead of merging them,
// so every field the root layout sets must be repeated here.
export function pageSocialMetadata({ title, description, path }) {
  const fullTitle = `${title} | ${siteName}`;
  return {
    openGraph: {
      type: "website",
      siteName,
      title: fullTitle,
      description,
      url: path,
      images: [{ url: socialImage, alt: socialImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [socialImage],
    },
  };
}
