import { Oswald, Poppins } from "next/font/google";
import "./globals.css";
import { ImageProvider } from "./context/ImageContext";
import ToastProvider from "../components/ToastProvider";

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
  title: "AI-Refine",
  description: "Image augmentation tool",
  icons: {
    icon: "/background/Wave.png",  // Ensure this path is correct
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Add a link to the favicon if it's not working through metadata */}
        <link rel="icon" href="/background/Wave.png" />
      </head>
      <body
        className={`${oswald.variable} ${poppins.variable} antialiased`}
      >
        <ToastProvider>
          <ImageProvider>
            {children}
          </ImageProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
