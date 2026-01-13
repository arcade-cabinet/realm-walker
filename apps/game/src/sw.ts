/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'realm-walker-v1';

const _self = self as any;

_self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', '/index.html', '/src/main.tsx', '/src/index.css']);
    }),
  );
});

_self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
