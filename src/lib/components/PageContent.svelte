<script>
  import { siteConfig } from '$lib/config';
  import { page } from '$app/state';
  import FAQ from './FAQ.svelte';

	const { data } = $props();
	const { content: PageContent, metadata } = $derived.by(() => data);

  const faqs = $derived(metadata?.faqs || []);

  // JSON-LD structured data for SEO/GEO (General Pages)
  const jsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: metadata?.title || siteConfig.title,
    description: metadata?.description || siteConfig.description,
    url: `${siteConfig.siteUrl}${page.url.pathname}`,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.title,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.siteUrl}/favicon.ico`
      }
    }
  });
</script>

<svelte:head>
  <title>
    {metadata?.title
      ? `${metadata.title} – ${siteConfig.title}`
      : siteConfig.title}
  </title>
	<meta name="description" content={metadata?.description ?? siteConfig.description} />
  
  <!-- Structured Data -->
  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>'}
</svelte:head>

<section class="prose max-w-3xl mx-auto px-4 py-10 dark:prose-invert">
  <PageContent />
  
  {#if faqs.length > 0}
    <div class="not-prose mt-16">
      <FAQ items={faqs} />
    </div>
  {/if}
</section>