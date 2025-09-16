/// <reference lib="WebWorker" />

import { defaultCache, StaleWhileRevalidate } from "@serwist/next/worker";
import type { PrecacheEntry, RouteHandler } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

// This is a placeholder for the Supabase URL.
// In a real-world scenario, you'd want to securely manage this.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
    console.error("Supabase URL is not defined. Offline data caching will not work.");
}

const aFewDays = 60 * 60 * 24 * 7; // 7 days in seconds

const apiHandler = new StaleWhileRevalidate({
    cacheName: "supabase-api-cache",
    plugins: [
        {
            // Only cache successful responses (2xx)
            cacheableResponse: {
                statuses: [200],
            },
        },
        {
            // Set an expiration for the cached data
            expiration: {
                maxAgeSeconds: aFewDays,
            },
        },
    ],
});

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // Caching strategy for the Supabase API
    {
        matcher: ({ url }) => url?.origin === supabaseUrl,
        handler: apiHandler,
    }
  ],
});
