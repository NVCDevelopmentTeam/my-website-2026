/// <reference types="@sveltejs/kit" />
import { assets, prerendered as prerenderedManifest } from '$app/manifest'
import { version } from '$app/env'

// SvelteKit 3: the manifest exposes `{ path }` objects instead of plain strings.
var files = assets.map(function (asset) {
  return asset.path
})
var prerendered = prerenderedManifest.map(function (entry) {
  return entry.path
})

// Unique cache key per deployment
var CACHE = 'app-' + version

var STATIC_FILES = files.filter(function (file) {
  return !file.startsWith('/_') && !file.startsWith('/.')
})
var PRERENDERED_HTML = prerendered
// Only precache static files on install — hashed build assets are served by
// SvelteKit's own documented service worker pattern. Prerendered pages are
// NOT eagerly bulk-fetched here; networkFirstWithTimeout() below caches each
// one lazily, on demand, the first time it's actually visited.
// Only static files are precached. Hashed build assets are intentionally
// excluded: the fetch handler no longer serves them (see above), so caching
// them here would download the whole bundle on install for nothing.
var ALL_ASSETS = [].concat(STATIC_FILES)

// Install — pre-cache all known assets safely
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(function (cache) {
        return Promise.allSettled(
          ALL_ASSETS.map(function (asset) {
            return cache.add(asset)
          })
        )
      })
      .then(function () {
        return self.skipWaiting()
      })
  )
})

// Activate — purge old caches, claim clients immediately
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key !== CACHE
            })
            .map(function (key) {
              return caches.delete(key)
            })
        )
      })
      .then(function () {
        return self.clients.claim()
      })
  )
})

// Fetch — route requests to appropriate caching strategy
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith('http')) return

  var url = new URL(event.request.url)

  // Bypass SW for cross-origin requests and dev server / Vite HMR endpoints
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/@') || url.pathname.includes('node_modules')) return

  // Immutable hashed JS/CSS — deliberately NOT intercepted.
  // These are content-hashed and preloaded by SvelteKit. If the service
  // worker answers them from Cache Storage, Chrome discards every preload
  // hint with "cross-world service worker resource mismatch" and then warns
  // again that the preload went unused. Letting them fall through to the
  // browser's own HTTP cache keeps the preloads effective; the hashed
  // filenames already guarantee correct long-term caching.
  if (url.pathname.startsWith('/_app/immutable/')) return

  // Fonts — cache-first (permanent, eliminates FOIT/CLS)
  if (url.pathname.startsWith('/fonts/')) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  // Normalize pathname (with and without trailing slash)
  var normalizedPath = url.pathname
  var trimmedPath =
    normalizedPath.endsWith('/') && normalizedPath.length > 1
      ? normalizedPath.slice(0, -1)
      : normalizedPath

  // Prerendered HTML — network-first with cache fallback (still works offline).
  // NOT stale-while-revalidate: cached HTML from a previous deploy references
  // content-hashed /_app/immutable/ files that no longer exist after a new deploy,
  // which left the page without working JavaScript on the first visit after a deploy.
  if (PRERENDERED_HTML.includes(normalizedPath) || PRERENDERED_HTML.includes(trimmedPath)) {
    event.respondWith(networkFirstWithTimeout(event.request, 3000))
    return
  }

  // Other static files — cache-first
  if (STATIC_FILES.includes(normalizedPath) || STATIC_FILES.includes(trimmedPath)) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  // Everything else — network-first with 3s timeout, graceful fallback
  event.respondWith(networkFirstWithTimeout(event.request, 3000))
})

/**
 * Cache-first: serve from cache, fetch on miss. Both the initial fetch and
 * any retry are time-boxed — a bare retry with no timeout can hang for the
 * browser's default stalled-connection timeout (commonly ~30s) on a weak or
 * flaky connection, which is exactly the condition this needs to handle well.
 */
async function cacheFirst(request) {
  var cache = await caches.open(CACHE)
  var cached = await cache.match(request)
  if (cached) return cached

  try {
    var response = await fetchWithTimeout(request, 8000)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    return new Response('Network error', {
      status: 504,
      statusText: 'Gateway Timeout',
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

/**
 * fetch() with a hard timeout via AbortController — shared by cacheFirst()
 * and networkFirstWithTimeout() so no request can hang indefinitely.
 */
function fetchWithTimeout(request, timeoutMs) {
  var controller = new AbortController()
  var timer = setTimeout(function () {
    controller.abort()
  }, timeoutMs)

  return fetch(request, { signal: controller.signal }).finally(function () {
    clearTimeout(timer)
  })
}

/**
 * Network-first with timeout: try network, fall back to cache
 */
async function networkFirstWithTimeout(request, timeoutMs) {
  var cache = await caches.open(CACHE)

  try {
    var response = await fetchWithTimeout(request, timeoutMs)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    var cached = await cache.match(request)
    if (cached) return cached
    return new Response('Network error', {
      status: 504,
      statusText: 'Gateway Timeout',
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

// Handle skip-waiting message from client
self.addEventListener('message', function (event) {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
