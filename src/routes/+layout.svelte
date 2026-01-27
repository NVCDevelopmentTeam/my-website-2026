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
<<<<<<< Updated upstream
  <link href="/sveltiaconfig.json" type="application/json" rel="cms-config-url" />
  <link rel="sitemap" type="application/xml" href="{siteConfig.siteUrl}/sitemap.xml" />
  <link rel="alternate" type="application/rss+xml" href="{siteConfig.siteUrl}/rss.xml" />
  </svelte:head>

<div class="min-h-screen bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 flex flex-col selection:bg-sky-100 dark:selection:bg-sky-900/30">
  {@render children?.()}
</div>

=======

  <link href="/sveltiaconfig.json" type="application/json" rel="cms-config-url" />
  <link rel="sitemap" type="application/xml" href="{siteConfig.siteUrl}/sitemap.xml" />
  <link rel="alternate" type="application/rss+xml" href="{siteConfig.siteUrl}/rss.xml" />
  
  <!-- Performance: Preconnect & Load optimized fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 flex flex-col selection:bg-sky-100 dark:selection:bg-sky-900/30">
  {@render children?.()}
</div>
>>>>>>> Stashed changes
