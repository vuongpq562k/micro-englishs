// Service Worker for caching CEFR vocabulary data
const CACHE_NAME = "vocabulary-cache-v1";
const VOCABULARY_URL = `${import.meta.env.VITE_BASE_URL}/cefrj-vocabulary.csv`;

// Files to cache on install
const FILES_TO_CACHE = [VOCABULARY_URL];

// Install event - cache vocabulary data
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching vocabulary data");
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  // Clear any existing caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log("Service Worker: Removing cache", cacheName);
          return caches.delete(cacheName);
        }),
      );
    }),
  );
});

// No fetch event handler - let all requests go to the network
// Fetch event - serve from cache if available
self.addEventListener("fetch", (event) => {
  // Only handle vocabulary CSV requests
  if (event.request.url.includes("cefrj-vocabulary.csv")) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached response if available
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request).then((networkResponse) => {
          // Clone the response for both cache and return
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      }),
    );
  }
});
