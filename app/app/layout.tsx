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

const APP_URL = "https://app.1pride.app";
const TITLE = "1PRIDE — Lions Analytics";
const DESCRIPTION =
  "End-to-end Lions analytics. Real nflverse data for the entire Dan Campbell era — game scores, stat leaders, NFC North standings, and a 4th-down identity built from 248k+ plays. Level 5 capstone of the 1PRIDE data curriculum.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: "%s — 1PRIDE",
  },
  description: DESCRIPTION,
  applicationName: "1PRIDE",
  keywords: [
    "Detroit Lions",
    "NFL analytics",
    "Dan Campbell",
    "data curriculum",
    "nflverse",
    "Next.js",
    "FastAPI",
    "data visualization",
    "sports data",
  ],
  authors: [{ name: "Joe Harwood" }],
  creator: "Joe Harwood",

  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "1PRIDE",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },

  // Don't index until launch — flip these to false for production
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },

  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
};

export const viewport = {
  themeColor: "#0076B6",
  width: "device-width",
  initialScale: 1,
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
