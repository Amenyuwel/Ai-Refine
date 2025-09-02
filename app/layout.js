import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ImageProvider } from "./context/ImageContext";
import ToastProvider from "../components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
