<script>
  import './layout.css'
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { siteConfig } from '#lib/config.js'
  import { retireServiceWorkers } from '#lib/utils/retireServiceWorkers.js'

  let { children } = $props()
  // Page changes are announced by SvelteKit's own built-in route announcer (an assertive live
  // region that reads the new document title after every client-side navigation). A second,
  // custom announcer used to repeat the title, so screen readers said it twice.

  onMount(() => {
    // The site no longer registers a service worker (caching is done by the server).
    // Visitors who still have the old one are cleaned up here, once.
    retireServiceWorkers()

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
-->
<div
  class="min-h-screen flex flex-col text-gray-950 selection:bg-sky-100 dark:text-gray-50 dark:selection:bg-sky-900/30"
>
  {@render children?.()}
</div>

<style uno:preflights uno:safelist global></style>
