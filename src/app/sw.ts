import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { BackgroundSync, StaleWhileRevalidate } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const supabaseUrl = "https://ekyflmcazpyuytrpwvop.supabase.co";

const backgroundSync = new BackgroundSync("offline-queue", {
  maxRetentionTime: 24 * 60, // Retry for max 24 hours
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "POST" && request.method !== "PATCH" && request.method !== "DELETE") {
    return;
  }

  const backgroundSyncHandler = async () => {
    try {
      const response = await fetch(request.clone());
      return response;
    } catch (error) {
      await backgroundSync.pushRequest({ request });
      return new Response(JSON.stringify({ message: "Request queued for sync" }), {
        status: 202,
        headers: { "Content-Type": "application/json" },
      });
    }
  };

  event.respondWith(backgroundSyncHandler());
});


self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});
