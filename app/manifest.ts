import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Go Gym or Go Broke",
    short_name: "Go Gym",
    description: "Log your workouts, prove it on camera, or pay up.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["health", "fitness", "lifestyle"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        // The glyph sits inside the maskable safe zone, so one file covers both.
        purpose: "any",
      },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Post proof",
        short_name: "Post",
        url: "/post",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      { name: "Scoreboard", short_name: "Scores", url: "/progress" },
    ],
  };
}
