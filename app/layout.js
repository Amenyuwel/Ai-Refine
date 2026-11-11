import { Oswald, Poppins } from "next/font/google";
import "./globals.css";
import { ImageProvider } from "./context/ImageContext";
import ToastProvider from "../components/ToastProvider";
import { siteUrl, siteName, siteDescription } from "./utils/siteConfig";

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} | Image augmentation tool`, template: `%s | ${siteName}` },
  description: siteDescription,
  applicationName: siteName,
  alternates: { canonical: "/" },
  icons: { icon: "/background/Wave.png" },
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} | Image augmentation tool`,
    description: siteDescription,
    url: "/",
    images: [{ url: "/images/Mutant.png", alt: "Image augmented into several variations" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Image augmentation tool`,
    description: siteDescription,
    images: ["/images/Mutant.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${poppins.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <a
          href="#main-content"
          className="bg-main text-main sr-only z-[100] rounded-md px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2 focus:ring-[var(--secondary)] focus:outline-none"
        >
          Skip to main content
        </a>
        <ToastProvider>
          <ImageProvider>
            {children}
          </ImageProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
