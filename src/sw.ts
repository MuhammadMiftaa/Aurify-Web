import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { Route, registerRoute } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & {
    skipWaiting: () => Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clients: any;
    __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
    addEventListener: (type: string, listener: (event: any) => void) => void;
  };

// Clean up old caches from previous versions
cleanupOutdatedCaches();

// Precache all static assets from build (injected by vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST);

// Skip waiting and claim clients immediately for faster updates
self.addEventListener("install", () => {
  void self.skipWaiting();
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(self.clients.claim());
});

// ============================================
// STATIC ASSET CACHING
// ============================================

// Cache images with CacheFirst (long-term)
const imageRoute = new Route(
  ({ request, sameOrigin }) => sameOrigin && request.destination === "image",
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);
registerRoute(imageRoute);

// Cache fonts with CacheFirst
const fontRoute = new Route(
  ({ request, sameOrigin }) => sameOrigin && request.destination === "font",
  new CacheFirst({
    cacheName: "fonts-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  }),
);
registerRoute(fontRoute);

// Cache Google Fonts stylesheets with StaleWhileRevalidate
const googleFontsRoute = new Route(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new StaleWhileRevalidate({
    cacheName: "google-fonts-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  }),
);
registerRoute(googleFontsRoute);

// NOTE: API/endpoint caching routes will be added later.
