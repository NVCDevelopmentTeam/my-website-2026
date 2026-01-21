<!-- src/lib/components/Seo.svelte -->
<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { siteConfig } from '$lib/config.js';

  export let title = siteConfig.title;
  export let description = siteConfig.description;
  export let type = 'website';

  let ready = false;
  onMount(() => ready = true);
</script>

<svelte:head>
  <title>{title} | {siteConfig.title}</title>
  <meta name="description" content={description} />

  <!-- Open Graph -->
  <meta property="og:type" content={type} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:site_name" content={siteConfig.title} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
</svelte:head>

{#if ready}
  <div in:fade={{ duration: 300 }}>
    <slot />
  </div>
{/if}
