/// <reference lib="WebWorker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";

declare const self: ServiceWorkerGlobalScope;

const supabaseUrl = "https://aomffgrbwnioqpvbfcfv.supabase.co";

const runtimeCaching: RuntimeCaching[] = [
    ...defaultCache,
    {
        matcher: ({ url }) => {
            return url.origin === supabaseUrl;
        },
        handler: "StaleWhileRevalidate",
        options: {
            cacheName: "supabase-data",
            expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
            },
        },
    }
];

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: runtimeCaching,
});
