/// <reference lib="WebWorker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";

// The installSerwist function is called to set up the service worker.
// It is configured with a precache manifest, which is a list of all the
// files that should be cached when the service worker is installed.
// The runtimeCaching array is configured to use the default cache
// for all requests.
installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});
