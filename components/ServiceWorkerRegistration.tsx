"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Register service worker after page load to not block rendering
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("[SW] Registered:", registration.scope);

          // Check for updates every hour
          setInterval(() => registration.update(), 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error("[SW] Registration failed:", error);
        });
    });
  }, []);

  return null;
}
