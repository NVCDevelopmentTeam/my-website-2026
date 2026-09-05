<script>
  import './layout.css'
  import { onMount } from 'svelte'
  import { pushState, afterNavigate } from '$app/navigation'
  import { siteConfig } from '$lib/config'
  // ?url gives the final content-hashed build path, so the preload always
  // matches the actual deployed filename even though Vite renames it per build.
  import firaMonoLatin from '@fontsource/fira-mono/files/fira-mono-latin-400-normal.woff2?url'
  import firaMonoLatinExt from '@fontsource/fira-mono/files/fira-mono-latin-ext-400-normal.woff2?url'

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
  <link rel="preload" as="font" type="font/woff2" href={firaMonoLatin} crossorigin="anonymous" />
  <link rel="preload" as="font" type="font/woff2" href={firaMonoLatinExt} crossorigin="anonymous" />
</svelte:head>

<!--
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
  class="min-h-screen flex flex-col bg-white text-gray-950 dark:bg-gray-950 selection:bg-sky-100 dark:text-gray-50 dark:selection:bg-sky-900/30"
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
