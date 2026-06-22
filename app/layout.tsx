import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://caravanhq.you"),
  title: "Paris Phase Trip",
  description:
    "Our trip, day by day — forecast + plans for Paris, Versailles, London, Amsterdam & Bari.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Phase Trip",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    url: "https://caravanhq.you",
    siteName: "Caravan",
    title: "Paris Phase Trip",
    description: "Our trip, day by day — forecast, plans, and notes. On Caravan.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Paris Phase Trip — on Caravan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paris Phase Trip",
    description: "Our trip, day by day — forecast, plans, and notes. On Caravan.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#b5654a",
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
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
