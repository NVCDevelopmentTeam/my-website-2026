/*
 * Retired service worker — intentionally does nothing but remove itself.
 *
 * The site no longer uses a service worker: caching is handled by the server (Netlify CDN +
 * HTTP cache headers, see netlify.toml), which expires on its own and can never serve a
 * page that references build files of an older deploy.
 *
 * Browsers that still have the previous worker check THIS url for updates (it is served with
 * `no-cache`). Finding different code, they install it, and it then wipes every cache the old
 * worker created, unregisters itself and reloads the open pages. Visitors need to do nothing.
 * It has no `fetch` handler, so it never intercepts a request.
 *
 * It can be deleted once enough time has passed for returning visitors to have been cleaned
 * up (a few months); the same cleanup also runs from the page itself (see
 * src/lib/utils/retireServiceWorkers.js).
 */
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) await caches.delete(key)
      await self.registration.unregister()
      for (const client of await self.clients.matchAll({ type: 'window' }))
        client.navigate(client.url)
    })()
  )
})
