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
      console.log('requestOrigin', new URL(event.request.url).origin);
      console.log('swOrigin', sw.location.origin);

      if (
        process.env.NODE_ENV === 'development' ||
        new URL(event.request.url).origin !== sw.location.origin
      ) {
        console.log('return fetch');
        return fetch(event.request);
      }

      const cache = await caches.open(CACHE_NAME);
      const cacheResponse = await cache.match(event.request);

      if (cacheResponse) {
        console.log('refresh cache');
        cache.add(event.request);
        console.log('return cache');
        return cacheResponse;
      }

      console.log('fetch response');
      const response = await fetch(event.request);
      console.log('add to cache');
      cache.put(event.request, response.clone());

      console.log('return response');
      return response;
    })(),
  ),
);
