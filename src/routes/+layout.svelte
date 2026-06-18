<script>
  import { siteConfig } from '$lib/config'
  import '../app.css'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { pushState } from '$app/navigation'

  let { children } = $props()

  onMount(function () {
    if (!browser) return

    // Handle hash links (internal anchors) with smooth scrolling
    function handleAnchorClick(e) {
      var link = e.target.closest('a')
      if (!link) return

      var url = new URL(link.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname !== window.location.pathname) return

      var hash = url.hash
      if (hash && hash.length > 1) {
        var id = decodeURIComponent(hash.slice(1))
        var targetElement = document.getElementById(id)

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
      var id = decodeURIComponent(window.location.hash.slice(1))
      var el = document.getElementById(id)
      if (el) {
        setTimeout(function () {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300)
      }
    }

    return function () {
      window.removeEventListener('click', handleAnchorClick, { capture: true })
    }
  })
</script>

<svelte:head>
  <link href="/cmsConfig.json" type="application/json" rel="cms-config-url" />
  <meta name="google-adsense-account" content="ca-pub-3602487920405886" />
  <link rel="sitemap" type="application/xml" href="{siteConfig.siteUrl}/sitemap.xml" />
  <link rel="alternate" type="application/rss+xml" href="{siteConfig.siteUrl}/rss.xml" />
</svelte:head>

<div
  class="min-h-screen bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 flex flex-col selection:bg-sky-100 dark:selection:bg-sky-900/30"
>
  {@render children?.()}
</div>
