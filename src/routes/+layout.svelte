<script>
  import { siteConfig } from '$lib/config';
  import '../app.css';

  /** @type {Object} Props */
  let { children } = $props();
</script>

<svelte:head>
  <title>{siteConfig.title}</title>
  <meta name="description" content={siteConfig.description} />
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <meta name="google-adsense-account" content="ca-pub-3602487920405886" />
    <script      defer      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3602487920405886"      crossorigin="anonymous"    ></script>
  
  <link href="/sveltiaconfig.json" type="application/json" rel="cms-config-url" />
  <link rel="sitemap" type="application/xml" href="{siteConfig.siteUrl}/sitemap.xml" />
  <link rel="alternate" type="application/rss+xml" href="{siteConfig.siteUrl}/rss.xml" />
</svelte:head>

<div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
  <main class="flex-grow max-w-4xl mx-auto px-4 py-8 w-full" id="main-content">
    {@render children?.()}
  </main>
</div>