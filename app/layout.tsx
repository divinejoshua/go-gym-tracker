import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Go Gym or Go Broke",
  description: "Log your workouts, prove it on camera, or pay up.",
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  // The camera screen is full-bleed; keep it out from under the notch.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* pb-28 keeps the last card clear of the fixed bottom nav. */}
        <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5 sm:px-6">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
