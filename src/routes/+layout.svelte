<script>
  import './layout.css'
  import { onMount } from 'svelte'
  import { afterNavigate, goto, preloadData } from '$app/navigation'
  import { isLightMode } from '#lib/utils/device.js'
  import { scrollBehavior } from '#lib/utils/scroll.js'

  let { children } = $props()

  // A new page starts at the top (SvelteKit does this too; written out so it is instant, is never
  // animated, and always happens). Back/forward restore the old position, links with a #hash go
  // to their target, and a first load keeps whatever the browser restored.
  afterNavigate(({ type, to, shallow }) => {
    if (shallow && type === 'goto') return
    if ((type === 'link' || type === 'goto') && !to?.url.hash) scrollTo(0, 0)
  })

  onMount(() => {
    // The background photo (large screens) starts to load only when the page is done and the
    // browser has nothing else to do, so its fade-in never competes with hydration
    const showBackground = () => {
      if (isLightMode()) return
      const show = () => document.documentElement.classList.add('bg-ready')
      if ('requestIdleCallback' in window) requestIdleCallback(show, { timeout: 3000 })
      else setTimeout(show, 1000)
    }

    if (document.readyState === 'complete') showBackground()
    else window.addEventListener('load', showBackground, { once: true })

    // SvelteKit preloads a page on mouse hover and touch; keyboard and screen-reader users never
    // hover, so start loading a link's page when it receives focus too.
    /** @param {FocusEvent} e */
    function preloadFocusedLink(e) {
      if (isLightMode()) return // spend no data on pages nobody asked for
      if (!(e.target instanceof Element)) return
      const link = e.target.closest('a[href^="/"]:not([href^="//"])')
      if (link) preloadData(/** @type {string} */ (link.getAttribute('href'))).catch(() => {})
    }
    document.addEventListener('focusin', preloadFocusedLink)

    // Smooth same-page anchor scrolling via delegation.
    // Cleanup returned from onMount — no beforeunload/unload handlers used.
    /** @param {MouseEvent} e */
    function handleAnchorClick(e) {
      if (!(e.target instanceof Element)) return
      const link = /** @type {HTMLAnchorElement | null} */ (e.target.closest('a'))
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
          targetElement.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
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
        setTimeout(() => el.scrollIntoView({ behavior: scrollBehavior(), block: 'start' }), 300)
      }
    }

    return () => {
      window.removeEventListener('click', handleAnchorClick, { capture: true })
      document.removeEventListener('focusin', preloadFocusedLink)
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
