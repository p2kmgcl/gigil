import { manifest as fileList, version as hash } from '@parcel/service-worker';
import pkg from '../package.json';

const CACHE_NAME = `${pkg.name}-${pkg.version}-${hash}`;
const FILE_LIST = ['/', ...Array.from(new Set(fileList))];

const sw: ServiceWorkerGlobalScope =
  self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', (event) => {
  sw.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(FILE_LIST);
    })(),
  );
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
