import { siteUrl } from "./utils/siteConfig";

export default function sitemap() {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/feature/info`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
