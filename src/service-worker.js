/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
  ...build, // the app itself
  ...files // everything in `static`
];

const ASSETS_SET = new Set(ASSETS);

self.addEventListener('install', (event) => {
  // Create a new cache and add all assets to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
  // Delete old caches
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
  // ignore POST requests etc
  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // `build`/`files` can always be served from the cache
    // These are hashed (build) or immutable (files) usually
    if (ASSETS_SET.has(url.pathname)) {
      const cachedResponse = await cache.match(url.pathname);
      if (cachedResponse) return cachedResponse;
    }

    // For everything else, try a Stale-While-Revalidate strategy
    // This includes HTML pages, which ensures the site works offline
    // and loads instantly on subsequent visits
    const cachedResponse = await cache.match(event.request);

    const fetchPromise = fetch(event.request).then(async (networkResponse) => {
      if (networkResponse.status === 200) {
        // Cache the new response
        await cache.put(event.request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => {
      // If network fails, we've already returned the cached response if it exists
      // If it doesn't exist, we might want to return a fallback
    });

    return cachedResponse || fetchPromise;
  }

  event.respondWith(respond());
});