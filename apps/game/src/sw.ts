/* eslint-disable no-restricted-globals */
/// <reference lib="webworker" />

const CACHE_NAME = 'realm-walker-v1';

const sw = self as unknown as ServiceWorkerGlobalScope;

// Install: Pre-cache critical assets
sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', '/index.html', '/src/main.tsx', '/src/index.css']);
    }),
  );
});

// Activate: Clean up old caches and claim clients
sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }).then(() => {
      return sw.clients.claim();
    }),
  );
});

// Fetch: Stale-While-Revalidate strategy
sw.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Only cache successful responses
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Network failed, return cached response if available (offline scenario)
          return cachedResponse as Response;
        });

        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    }),
  );
});
