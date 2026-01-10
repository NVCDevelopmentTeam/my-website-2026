<script>
  import { siteConfig } from '$lib/config';
	const { data } = $props();
	const { content: PageContent, metadata } = $derived.by(() => data);
</script>

<svelte:head>
  <title>
    {data.metadata?.title
      ? `${data.metadata.title} – ${siteConfig.title}`
      : siteConfig.title}
  </title>
	<meta		name="description"		content={metadata.description ?? siteConfig.description}
	/>
</svelte:head>

<section class="prose max-w-3xl mx-auto px-4 py-10">
  <PageContent />
</section>
