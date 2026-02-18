<script>
  import { siteConfig } from '$lib/config';
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { pushState } from '$app/navigation';

  /** @type {Object} Props */
  let { children } = $props();

  onMount(() => {
    if (!browser) return;

    // Handle hash links (internal anchors)
    const handleAnchorClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      // Handle only internal links with hashes
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname !== window.location.pathname) return;
      
      const hash = url.hash;
      if (hash && hash.length > 1) {
        const id = decodeURIComponent(hash.slice(1));
        const targetElement = document.getElementById(id);

        if (targetElement) {
          e.preventDefault();
          
          // Perform smooth scroll
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update hash in URL without triggering router navigation or jumping
          pushState(hash, {});
        }
      }
    };

    window.addEventListener('click', handleAnchorClick, { capture: true });
    
    // Handle initial hash on load with a more robust check
    const handleInitialHash = () => {
      if (window.location.hash) {
        const id = decodeURIComponent(window.location.hash.slice(1));
        const el = document.getElementById(id);
        if (el) {
          // Small delay to ensure styles and layout are ready
          setTimeout(() => {
            el.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }, 500);
        }
      }
    };

    handleInitialHash();

    return () => {
      window.removeEventListener('click', handleAnchorClick, { capture: true });
    };
  });
</script>

<svelte:head>
  <link href="/cmsConfig.json" type="application/json" rel="cms-config-url" />
  <meta name="google-adsense-account" content="ca-pub-3602487920405886" />
  <link rel="sitemap" type="application/xml" href="{siteConfig.siteUrl}/sitemap.xml" />
  <link rel="alternate" type="application/rss+xml" href="{siteConfig.siteUrl}/rss.xml" />
</svelte:head>

<div class="min-h-screen bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 flex flex-col selection:bg-sky-100 dark:selection:bg-sky-900/30">
  {@render children?.()}
</div>
