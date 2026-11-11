import { pageSocialMetadata } from "../../utils/pageMetadata";

const title = "Learn image augmentation";
const description =
  "Short explanations of common image augmentation techniques such as flipping, blurring, grayscale and brightness changes, and why they help machine learning datasets.";
const path = "/feature/info";

export const metadata = {
  title,
  description,
  alternates: { canonical: path },
  ...pageSocialMetadata({ title, description, path }),
};

export default function InfoLayout({ children }) {
  return children;
}
