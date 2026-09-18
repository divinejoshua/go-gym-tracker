import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";

import { Analytics } from "@/components/analytics";
import { BottomNav } from "@/components/bottom-nav";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";

// The design system asks for Outfit. Loading it through next/font self-hosts the
// files and exposes them as --font-outfit, which globals.css feeds to --font-sans.
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Go Gym or Go Broke",
  description: "Log your workouts, prove it on camera, or pay up.",
  manifest: "/manifest.webmanifest",
  // Makes "Add to Home Screen" on iOS launch without Safari's chrome.
  appleWebApp: {
    capable: true,
    title: "Go Gym",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  // The camera screen is full-bleed; keep it out from under the notch.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        {/* pb-28 keeps the last card clear of the fixed bottom nav. */}
        <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5 sm:px-6">
          {children}
        </div>
        <BottomNav />
        <ServiceWorker />
        <Analytics />
      </body>
    </html>
  );
}
