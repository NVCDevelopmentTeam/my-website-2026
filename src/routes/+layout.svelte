<script>
  import 'virtual:uno.css'
  import '../app.css'
  import { onMount } from 'svelte'
  import { pushState, afterNavigate } from '$app/navigation'
  import { siteConfig } from '$lib/config'

  let { children } = $props()

  let announceA = $state('')
  let announceB = $state('')
  let useA = $state(true)

  // Double-buffer live region for accessible navigation announcements.
  // No beforeunload/unload event listeners — preserves BF-cache.
  afterNavigate(({ type }) => {
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
        }, 500)
      } else {
        announceB = title
        setTimeout(() => {
          announceB = ''
        }, 500)
      }
    })
  })

  onMount(() => {
    // Smooth same-page anchor scrolling via delegation.
    // Cleanup returned from onMount — no beforeunload/unload handlers used.
    function handleAnchorClick(e) {
      const link = e.target.closest('a')
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
          pushState(hash, {})
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
  Outer wrapper contains both live regions and page content.
  Live regions are INSIDE the wrapper — not direct children of <body>
  so pressing Home jumps to the wrapper top, not the hidden live region.
  Text auto-clears after 500ms — long enough for screen readers (~100ms) to
  announce, short enough that pressing Home won't land on visible text.
-->
<div
  class="flex min-h-screen flex-col bg-white text-gray-950 selection:bg-sky-100 dark:bg-gray-950 dark:text-gray-50 dark:selection:bg-sky-900/30"
>
  <!-- Double-buffer live regions inside wrapper -->
  <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
    {announceA}
  </div>
  <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
    {announceB}
  </div>

  {@render children?.()}
</div>
