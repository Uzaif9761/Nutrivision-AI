import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutriVision AI — Smart Diet Tracking",
  description:
    "Snap a photo of your meal and let AI instantly analyze its nutritional content. Track calories, macros, and hit your health goals effortlessly.",
  keywords: [
    "nutrition",
    "diet tracker",
    "AI food recognition",
    "calorie counter",
    "macro tracking",
    "health",
    "fitness",
  ],
  openGraph: {
    title: "NutriVision AI — Smart Diet Tracking",
    description:
      "AI-powered food recognition and nutrition tracking. Just snap and track.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
