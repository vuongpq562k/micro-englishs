// Service Worker with no caching functionality
self.addEventListener("install", () => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  // Log the base URL for debugging
  console.log("Service Worker installed with origin:", self.location.origin);
});

self.addEventListener("activate", (event) => {
  // Clear any existing caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log("Service Worker: Removing cache", cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// No fetch event handler - let all requests go to the network
