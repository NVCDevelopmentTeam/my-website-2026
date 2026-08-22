/// <reference types="@sveltejs/kit" />
import { build, files, prerendered, version } from '$service-worker'

// Unique cache key per deployment
var CACHE = 'app-' + version

var IMMUTABLE_ASSETS = build
var STATIC_FILES = files.filter(function (file) {
  return !file.startsWith('/_') && !file.startsWith('/.')
})
var PRERENDERED_HTML = prerendered
var ALL_ASSETS = [].concat(IMMUTABLE_ASSETS, STATIC_FILES, PRERENDERED_HTML)

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
    event.respondWith(staleWhileRevalidate(event.request))
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
 * Cache-first: serve from cache, fetch on miss
 */
async function cacheFirst(request) {
  var cache = await caches.open(CACHE)
  var cached = await cache.match(request)
  if (cached) return cached

  try {
    var response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    return fetch(request)
  }
}

/**
 * Stale-while-revalidate: serve cache instantly, revalidate in background
 */
async function staleWhileRevalidate(request) {
  var cache = await caches.open(CACHE)
  var cached = await cache.match(request)

  var revalidate = fetch(request)
    .then(function (response) {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(function () {
      return null
    })

  var fresh = await revalidate
  return cached ?? fresh ?? fetch(request)
}

/**
 * Network-first with timeout: try network, fall back to cache
 */
async function networkFirstWithTimeout(request, timeoutMs) {
  var cache = await caches.open(CACHE)

  try {
    var controller = new AbortController()
    var timer = setTimeout(function () {
      controller.abort()
    }, timeoutMs)

    var response = await fetch(request, { signal: controller.signal })
    clearTimeout(timer)
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
