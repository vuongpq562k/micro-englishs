// Service Worker for caching CEFR vocabulary data
const CACHE_NAME = "vocabulary-cache-v1";
// Use self.location.origin to get the base URL in service worker context
const BASE_URL = self.location.origin;
const VOCABULARY_URL = `${BASE_URL}/cefrj-vocabulary.csv`;

// Files to cache on install
const FILES_TO_CACHE = [VOCABULARY_URL];

// Install event - cache vocabulary data
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching vocabulary data");
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log("Service Worker: Skip waiting");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Install failed", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  // Clear any existing caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: Removing old cache", cacheName);
          return caches.delete(cacheName);
          }
        }),
      );
    }).then(() => {
      console.log("Service Worker: Claiming clients");
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache if available
self.addEventListener("fetch", (event) => {
  // Only handle vocabulary CSV requests
  if (event.request.url.includes("cefrj-vocabulary.csv")) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached response if available
        if (response) {
          console.log("Service Worker: Serving from cache", event.request.url);
          return response;
        }

        // Otherwise fetch from network
        console.log("Service Worker: Fetching from network", event.request.url);
        return fetch(event.request).then((networkResponse) => {
          // Only cache successful responses
          if (networkResponse.status === 200) {
          // Clone the response for both cache and return
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
              console.log("Service Worker: Cached response", event.request.url);
          });
          }

          return networkResponse;
        }).catch((error) => {
          console.error("Service Worker: Fetch failed", error);
          throw error;
        });
      }),
    );
  }
});
