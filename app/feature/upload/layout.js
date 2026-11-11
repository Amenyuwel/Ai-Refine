import { pageSocialMetadata } from "../../utils/pageMetadata";

const title = "Augment your images";
const description = "Adjust, preview and download your augmented images.";
const path = "/feature/upload";

export const metadata = {
  title,
  description,
  // Overrides the root "/" canonical, which would name the home page for a noindex page.
  alternates: { canonical: path },
  // Session-based tool page with no indexable content of its own.
  robots: { index: false, follow: false },
  ...pageSocialMetadata({ title, description, path }),
};

export default function UploadLayout({ children }) {
  return children;
}
