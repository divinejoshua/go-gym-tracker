/*
 * Go Gym or Go Broke — service worker.
 *
 * Deliberately conservative: the feed is live data, so pages are never served
 * from cache while the network is reachable. The cache exists to make the app
 * launch instantly and to show a real page instead of Safari's error when the
 * gym's Wi-Fi drops.
 */
const VERSION = "v1";
const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const OFFLINE_URL = "/offline.html";

const SHELL = [OFFLINE_URL, "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only ever touch our own origin. Supabase media and uploads go straight out.
  if (url.origin !== self.location.origin) return;

  // Never cache the upload endpoint or any other API traffic.
  if (url.pathname.startsWith("/api/")) return;

  // Page navigations: always try the network so the feed is fresh, and fall
  // back to the offline page only when the request genuinely fails.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(SHELL_CACHE);
        return (await cache.match(OFFLINE_URL)) ?? Response.error();
      }),
    );
    return;
  }

  // Build output is content-hashed and immutable, so cache-first is safe here
  // and is what makes a warm launch feel instant.
  if (url.pathname.startsWith("/_next/static/") || SHELL.includes(url.pathname)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(ASSET_CACHE);
          cache.put(request, response.clone());
        }
        return response;
      })(),
    );
  }
});
