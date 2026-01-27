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
  <!-- Fix: Svelte attribute binding must be unquoted expression -->
  <link rel="sitemap" type="application/xml" href={siteConfig.siteUrl + '/sitemap.xml'} />
</svelte:head>

<slot />
