import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in a parent directory otherwise
  // makes Turbopack guess wrong and warn on every build.
  turbopack: { root: __dirname },

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
