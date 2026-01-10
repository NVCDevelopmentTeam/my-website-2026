<script>
  import { siteConfig } from '$lib/config';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children, data } = $props();
</script>

<svelte:head>
  <title>{siteConfig.title}</title>
  <meta name="description" content={siteConfig.description} />
</svelte:head>

<div class="flex flex-col min-h-screen">
<Header data={data} pages={data.pages} />

<main id="main-content" tabindex="-1" class="flex-grow max-w-7xl mx-auto bg-custom-background bg-cover bg-center w-full">
  <!-- Google AdSense ad units can be placed here for integration -->
  {@render children?.()}
</main>

<Footer latestPosts={data.latestPosts} />
</div>