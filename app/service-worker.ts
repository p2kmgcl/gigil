import pkg from '../package.json';
const CACHE_NAME = `${pkg.name}-${pkg.version}`;

const sw: ServiceWorkerGlobalScope =
  self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', () => {
  sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key)),
      );
    })(),
  );
});

sw.addEventListener('fetch', (event) =>
  event.respondWith(
    (async () => {
      if (
        process.env.NODE_ENV === 'development' ||
        new URL(event.request.url).origin !== sw.location.origin
      ) {
        return fetch(event.request);
      }

      const cache = await caches.open(CACHE_NAME);
      const cacheResponse = await cache.match(event.request);

      if (cacheResponse) {
        cache.add(event.request);
        return cacheResponse;
      }

      const response = await fetch(event.request);
      cache.put(event.request, response.clone());

      return response;
    })(),
  ),
);
