<script>
  import PageContent from '$lib/components/PageContent.svelte';
  import Seo from 'sk-seo';
  import { getSeoConfig } from '$lib/utils/seo';
  import { page } from '$app/state';

  let { data } = $props();
  const { metadata } = $derived.by(() => data);

  const seoConfig = $derived(getSeoConfig({
    title: metadata?.title,
    description: metadata?.description,
    url: page.url.pathname
  }));
</script>

<svelte:head>
  <Seo {...seoConfig} />
</svelte:head>

<PageContent {data} />