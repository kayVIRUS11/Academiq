/// <reference lib="WebWorker" />

import { defaultCache, StaleWhileRevalidate } from "@serwist/next/worker";
import type { PrecacheEntry } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

// The Supabase URL is public and must be explicitly provided as a string
// for the service worker context, which cannot access process.env.
const supabaseUrl = "https://ytfgjvezyqbsxdyvtsgy.supabase.co";

const apiHandler = new StaleWhileRevalidate({
    cacheName: "supabase-api-cache",
    plugins: [
        {
            cacheableResponse: {
                statuses: [200],
            },
        },
        {
            expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
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
