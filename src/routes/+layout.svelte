<script>
  import { siteConfig } from '$lib/config';
  import '../app.css';

  /** @type {Object} Props */
  let { children } = $props();
</script>

<svelte:head>
  <title>{siteConfig.title}</title>
  <meta name="description" content={siteConfig.description} />
  
  <meta name="google-adsense-account" content="ca-pub-3602487920405886" />
  <link href="/sveltiaconfig.json" type="application/json" rel="cms-config-url" />
  <link rel="sitemap" type="application/xml" href="{siteConfig.siteUrl}/sitemap.xml" />
  <link rel="alternate" type="application/rss+xml" href="{siteConfig.siteUrl}/rss.xml" />
  </svelte:head>

<div class="min-h-screen bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 flex flex-col selection:bg-sky-100 dark:selection:bg-sky-900/30">
  {@render children?.()}
</div>

