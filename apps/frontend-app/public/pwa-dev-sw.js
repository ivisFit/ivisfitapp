/* Minimal SW so Chrome/Edge treat localhost as installable during next dev. No caching. */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Required for installability. Not calling respondWith keeps network default.
});
