import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in a parent directory otherwise
  // makes Turbopack guess wrong and warn on every build.
  turbopack: { root: __dirname },

  // Next blocks cross-origin requests to dev-only assets, allowing only
  // localhost and the hostname the server started with. Opening the dev server
  // from a phone on the LAN therefore 403s every JS chunk: the page still
  // server-renders, but nothing hydrates, so navigation falls back to full
  // page loads and client components never become interactive.
  // `*` matches exactly one hostname label, so these cover the usual private
  // ranges. Add your own if your router hands out something different.
  allowedDevOrigins: [
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "172.17.*.*",
    "172.18.*.*",
    "172.19.*.*",
    "172.20.*.*",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Matches any Supabase project's public storage URLs.
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
