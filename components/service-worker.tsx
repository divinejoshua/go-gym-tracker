"use client";

import { useEffect } from "react";

/**
 * Registers the service worker that makes the app installable and gives it an
 * offline page.
 *
 * Production only: a service worker sitting in front of the dev server
 * intercepts HMR requests and makes hot reloading unreliable.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // An unavailable service worker must never break the app itself.
      });
    };

    // Registering after load keeps it off the critical path for first paint.
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
