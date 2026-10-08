<script>
  import './layout.css'
  import { onMount } from 'svelte'
  import { goto, afterNavigate } from '$app/navigation'
  import { dev } from '$app/env'
  import { siteConfig } from '#lib/config.js'

  let { children } = $props()
  let announceA = $state('')
  let announceB = $state('')
  let useA = $state(true)

  // Double-buffer live region for accessible navigation announcements.
  // No beforeunload/unload event listeners — preserves BF-cache.
  afterNavigate(({ type, shallow }) => {
    if (shallow) return
    if (type === 'enter') return

    const title = document.title || siteConfig.title

    announceA = ''
    announceB = ''

    requestAnimationFrame(() => {
      useA = !useA
      if (useA) {
        announceA = title
        setTimeout(() => {
          announceA = ''
        }, 150)
      } else {
        announceB = title
        setTimeout(() => {
          announceB = ''
        }, 150)
      }
    })
  })

  onMount(() => {
    // Service worker: production only (see svelte.config.js — automatic
    // registration is disabled there). Running a caching service worker
    // against Vite's dev server causes stale/mismatched state whenever the
    // dev server restarts, since its module graph changes every time but an
    // already-active worker keeps trying to serve fetches against the old
    // one — this is what caused blank pages that needed a manual hard
    // navigation to recover from. Deferred via setTimeout so it never
    // competes with the page's own critical-path work right after load.
    if (!dev && 'serviceWorker' in navigator) {
      setTimeout(() => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            // Proactively check for a newer worker on every load instead of
            // waiting for the browser's own periodic check (often 24h+) —
            // shortens how long a stale worker from a previous deploy can
            // keep serving mismatched content.
            registration.update()
          })
          .catch(() => {
            // Progressive enhancement: the site works fully without the
            // service worker, so a failed registration (flaky network, 404)
            // must not surface as an uncaught promise rejection in the console.
          })
      }, 0)
    } else if (dev && 'serviceWorker' in navigator) {
      // Dev server: never run a caching worker. One left over from an older version of
      // the site (or a production preview on this same origin) would keep answering
      // Vite's module requests with its 3s network-first fallback — slow first compiles
      // then show up as blank pages (only the URL as the tab title) until it is removed.
      navigator.serviceWorker
        .getRegistrations()
        .then(async (registrations) => {
          const wasControlled = !!navigator.serviceWorker.controller
          await Promise.all(registrations.map((registration) => registration.unregister()))
          if ('caches' in window) {
            const keys = await caches.keys()
            await Promise.all(keys.map((key) => caches.delete(key)))
          }
          // A page still controlled by the removed worker keeps using it until reloaded
          if (wasControlled && !sessionStorage.getItem('dev-sw-cleaned')) {
            sessionStorage.setItem('dev-sw-cleaned', '1')
            location.reload()
          }
        })
        .catch(() => {})
    }

    // Smooth same-page anchor scrolling via delegation.
    // Cleanup returned from onMount — no beforeunload/unload handlers used.
    /** @param {MouseEvent} e */
    function handleAnchorClick(e) {
      const link = /** @type {HTMLElement} */ (e.target).closest('a')
      if (!link) return
      const url = new URL(link.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname !== window.location.pathname) return
      const hash = url.hash
      if (hash && hash.length > 1) {
        const id = decodeURIComponent(hash.slice(1))
        const targetElement = document.getElementById(id)
        if (targetElement) {
          e.preventDefault()
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          goto(hash, { shallow: true })
        }
      }
    }

    window.addEventListener('click', handleAnchorClick, { capture: true })

    // Handle initial hash on page load
    if (window.location.hash) {
      const id = decodeURIComponent(window.location.hash.slice(1))
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
      }
    }

    return () => {
      window.removeEventListener('click', handleAnchorClick, { capture: true })
    }
  })
</script>

<svelte:head>
  <meta name="google-adsense-account" content="ca-pub-3602487920405886" />
  <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
  <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
</svelte:head>

<!--
  Outer wrapper has no background of its own: the body carries the page colour and the site
  background image (layout.css), and each layout draws its own solid surface on top.
  Outer wrapper contains both live regions and page content.
  Live regions are placed AFTER page content (not before) so that pressing
  Home (jump to document top) lands on the actual page heading/content
  first, not the announcer — a screen reader reading top-to-bottom also
  reaches the (by-then-cleared) announcer last instead of first.
  Text auto-clears after 150ms — verified via a real WordPress a11y bug report
  that VoiceOver needs ~150ms minimum to reliably announce repeated/identical
  text; long enough to be heard, short enough that it clears well before a
  user would navigate again.
-->
<div
  class="min-h-screen flex flex-col text-gray-950 selection:bg-sky-100 dark:text-gray-50 dark:selection:bg-sky-900/30"
>
  {@render children?.()}

  <!-- Double-buffer live regions — placed last, see comment above -->
  <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
    {announceA}
  </div>
  <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
    {announceB}
  </div>
</div>

<style uno:preflights uno:safelist global></style>
