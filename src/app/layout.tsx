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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "AutoSpare Parts";

const description =
  "Browse genuine and compatible spare parts for cars and bikes. Wide stock, fair prices, fast local service.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${storeName} — Genuine Car & Bike Spare Parts`,
    template: `%s | ${storeName}`,
  },
  description,
  openGraph: {
    type: "website",
    siteName: storeName,
    title: `${storeName} — Genuine Car & Bike Spare Parts`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${storeName} — Genuine Car & Bike Spare Parts`,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
