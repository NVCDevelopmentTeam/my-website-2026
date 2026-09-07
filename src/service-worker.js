/// <reference types="@sveltejs/kit" />
import { build, files, prerendered, version } from '$service-worker'

// Unique cache key per deployment
var CACHE = 'app-' + version

var IMMUTABLE_ASSETS = build
var STATIC_FILES = files.filter(function (file) {
  return !file.startsWith('/_') && !file.startsWith('/.')
})
var PRERENDERED_HTML = prerendered
// Only precache the app shell (build + static files) on install — matches
// SvelteKit's own documented service worker pattern. Prerendered pages are
// NOT eagerly bulk-fetched here; staleWhileRevalidate() below caches each
// one lazily, on demand, the first time it's actually visited.
var ALL_ASSETS = [].concat(IMMUTABLE_ASSETS, STATIC_FILES)

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

  // Immutable hashed JS/CSS — cache-first (permanent)
  if (url.pathname.startsWith('/_app/immutable/')) {
    event.respondWith(cacheFirst(event.request))
    return
  }

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

  // Prerendered HTML — stale-while-revalidate (instant paint + fresh data)
  if (PRERENDERED_HTML.includes(normalizedPath) || PRERENDERED_HTML.includes(trimmedPath)) {
    event.respondWith(staleWhileRevalidate(event))
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
 * Stale-while-revalidate: serve cache instantly, revalidate in background.
 * event.waitUntil() keeps the worker alive for the background fetch even
 * after we've already returned the cached response via respondWith().
 */
async function staleWhileRevalidate(event) {
  var cache = await caches.open(CACHE)
  var cached = await cache.match(event.request)

  var revalidate = fetchWithTimeout(event.request, 8000)
    .then(function (response) {
      if (response.ok) cache.put(event.request, response.clone())
      return response
    })
    .catch(function () {
      return null
    })

  event.waitUntil(revalidate)

  if (cached) return cached
  return (await revalidate) ?? fetchWithTimeout(event.request, 8000)
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
