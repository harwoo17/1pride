import type { Metadata } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Intro } from "@/components/Intro";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1PRIDE — Lions Analytics",
  description:
    "Lions analytics, end to end. Built as the Level 5 capstone of the 1PRIDE curriculum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--lions-paper-warm)] text-[var(--lions-charcoal)] font-sans">
        <Intro />
        {children}
      </body>
    </html>
  );
}
