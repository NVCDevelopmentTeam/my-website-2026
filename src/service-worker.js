/// <reference types="@sveltejs/kit" />
import { build, files, prerendered, version } from '$service-worker'

// Unique cache key per deployment — version changes on every build
const CACHE = `app-${version}`

/*
  Caching strategy (optimized for mobile Lighthouse — all 4 metrics):

  ┌─────────────────────────────┬──────────────────────────────┬─────────────────────────────────────┐
  │ Asset type                  │ Strategy                     │ Why                                 │
  ├─────────────────────────────┼──────────────────────────────┼─────────────────────────────────────┤
  │ /_app/immutable/** (JS/CSS) │ Cache-First (permanent)      │ Content-hashed → safe forever       │
  │ /fonts/**                   │ Cache-First (permanent)      │ Never changes → eliminates CLS/FOIT │
  │ /static/** (images, icons)  │ Cache-First                  │ Rarely changes, no revalidation     │
  │ Prerendered HTML pages      │ Stale-While-Revalidate       │ Instant paint + always fresh        │
  │ Everything else             │ Network-First (3s timeout)   │ Dynamic → fresh, but graceful fail  │
  └─────────────────────────────┴──────────────────────────────┴─────────────────────────────────────┘

  Mobile-specific fixes vs previous version:
    - /fonts/ cached permanently       → eliminates repeat-visit FOIT → fixes CLS
    - HTML uses SWR                    → FCP/LCP instant on slow 4G/3G
    - Network-First with 3s timeout    → TBT won't spike waiting on hung requests
    - clients.claim() on activate      → new SW takes over immediately → no stale content
*/

const IMMUTABLE_ASSETS = build // /_app/immutable/** — Vite-hashed JS/CSS chunks
const STATIC_FILES = files // /static/**         — favicon, fonts, images
const PRERENDERED_HTML = prerendered // prerendered HTML pages

const ALL_ASSETS = [...IMMUTABLE_ASSETS, ...STATIC_FILES, ...PRERENDERED_HTML]

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ALL_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  )
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith('http')) return

  const url = new URL(event.request.url)

  // Bypass SW for cross-origin requests (CDN, analytics, APIs)
  if (url.origin !== self.location.origin) return

  // 1. Immutable hashed JS/CSS → Cache-First, permanent
  //    Content-hashed filenames: URL changes when content changes.
  //    Zero revalidation cost, eliminates TBT from re-fetching known assets.
  if (url.pathname.startsWith('/_app/immutable/')) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  // 2. Fonts → Cache-First, permanent
  //    Large files that never change at the same URL.
  //    Permanent cache eliminates FOIT/CLS on every repeat visit on mobile.
  if (url.pathname.startsWith('/fonts/')) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  // 3. Prerendered HTML → Stale-While-Revalidate
  //    Critical fix for FCP + LCP on mobile (slow 4G/3G):
  //    Cached HTML is served in <5ms instead of waiting 500–2000ms for network.
  //    Background revalidation keeps content fresh for next visit.
  if (PRERENDERED_HTML.includes(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event.request))
    return
  }

  // 4. Other static files (images, icons, manifest) → Cache-First
  if (STATIC_FILES.includes(url.pathname)) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  // 5. Everything else → Network-First with 3s timeout
  //    Falls back to cache if network is slow or offline.
  //    3s cap prevents TBT spike from main thread waiting on hung requests.
  event.respondWith(networkFirstWithTimeout(event.request, 3000))
})

// ── Strategies ────────────────────────────────────────────────────────────────

/**
 * Cache-First
 * Serve from cache immediately; fetch and cache on miss.
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    return Response.error()
  }
}

/**
 * Stale-While-Revalidate
 * Serve cache instantly; revalidate in the background.
 *
 * Fixes FCP + LCP on mobile: cached HTML paints immediately without
 * waiting for a network round-trip on slow connections.
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)

  // Always revalidate in the background regardless of cache state
  const revalidate = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => null)

  // Serve stale immediately if available, otherwise await network
  return cached ?? (await revalidate) ?? Response.error()
}

/**
 * Network-First with timeout
 * Try network; fall back to cache if network exceeds `timeoutMs`.
 *
 * Fixes TBT on mobile: a hung network request no longer blocks
 * indefinitely — the SW resolves within timeoutMs via cache fallback.
 */
async function networkFirstWithTimeout(request, timeoutMs) {
  const cache = await caches.open(CACHE)

  const networkRace = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('sw-timeout')), timeoutMs)

    fetch(request)
      .then((response) => {
        clearTimeout(timer)
        if (response.ok) cache.put(request, response.clone())
        resolve(response)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })

  try {
    return await networkRace
  } catch {
    const cached = await cache.match(request)
    return cached ?? Response.error()
  }
}

// ── Message ───────────────────────────────────────────────────────────────────
// Trigger SW update programmatically from client:
// navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' })
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
