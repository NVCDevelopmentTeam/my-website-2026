/// <reference types="@sveltejs/kit" />
import { build, files, prerendered, version } from '$service-worker'

// Unique cache key per deployment
var CACHE = 'app-' + version

var IMMUTABLE_ASSETS = build
var STATIC_FILES = files
var PRERENDERED_HTML = prerendered
var ALL_ASSETS = [].concat(IMMUTABLE_ASSETS, STATIC_FILES, PRERENDERED_HTML)

// Install — pre-cache all known assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(function (cache) {
        return cache.addAll(ALL_ASSETS)
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

  // Bypass SW for cross-origin requests
  if (url.origin !== self.location.origin) return

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

  // Prerendered HTML — stale-while-revalidate (instant paint + fresh data)
  if (PRERENDERED_HTML.includes(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event.request))
    return
  }

  // Other static files — cache-first
  if (STATIC_FILES.includes(url.pathname)) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  // Everything else — network-first with 3s timeout
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
    return Response.error()
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

  return cached ?? (await revalidate) ?? Response.error()
}

/**
 * Network-first with timeout: try network, fall back to cache
 */
async function networkFirstWithTimeout(request, timeoutMs) {
  var cache = await caches.open(CACHE)

  var networkRace = new Promise(function (resolve, reject) {
    var timer = setTimeout(function () {
      reject(new Error('sw-timeout'))
    }, timeoutMs)

    fetch(request)
      .then(function (response) {
        clearTimeout(timer)
        if (response.ok) cache.put(request, response.clone())
        resolve(response)
      })
      .catch(function (err) {
        clearTimeout(timer)
        reject(err)
      })
  })

  try {
    return await networkRace
  } catch {
    var cached = await cache.match(request)
    return cached ?? Response.error()
  }
}

// Handle skip-waiting message from client
self.addEventListener('message', function (event) {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
