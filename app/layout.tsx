import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crop Advisor",
  description: "AI for Bharat hackathon MVP",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
