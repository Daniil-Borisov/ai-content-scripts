import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScriptForge AI — AI-Powered Content Scripts for Every Platform",
  description:
    "Turn any topic into platform-perfect scripts for YouTube, TikTok, Reels, Shorts, Instagram, and LinkedIn. From idea to publish-ready content in minutes.",
  openGraph: {
    title: "ScriptForge AI — AI-Powered Content Scripts",
    description:
      "From idea to publish-ready content in minutes. Scripts for YouTube, TikTok, Reels, Shorts, Instagram, and LinkedIn.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
