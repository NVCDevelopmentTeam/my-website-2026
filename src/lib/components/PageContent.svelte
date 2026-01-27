<script>
  import { siteConfig } from '$lib/config';
  import { page } from '$app/state';
  import FAQ from './FAQ.svelte';

  // Receive `data` prop from parent load() result
  // (We access it defensively to avoid runtime errors during prerender)
  const { data } = $props() || {};
  const PageContent = data?.content || null;
  const metadata = data?.metadata || {};

  // FAQs array (may be undefined)
  const faqs = Array.isArray(metadata?.faqs) ? metadata.faqs : [];

  // JSON-LD structured data (defensive)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: metadata?.title || siteConfig.title,
    description: metadata?.description || siteConfig.description,
    url: `${siteConfig.siteUrl}${page?.url?.pathname ?? ''}`,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.title,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.siteUrl}/favicon.ico`
      }
    }
  };
</script>

<svelte:head>
  <title>
    {#if metadata?.title}
      {metadata.title} – {siteConfig.title}
    {:else}
      {siteConfig.title}
    {/if}
  </title>
  <meta name="description" content={metadata?.description ?? siteConfig.description} />

  <!-- Structured Data -->
  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>'}
</svelte:head>

<section class="prose max-w-3xl mx-auto px-4 py-10 dark:prose-invert">
  {#if PageContent}
    <!-- Render the content component produced by markdown (if any) -->
    <svelte:component this={PageContent} />
  {:else}
    <!-- Fallback: show raw HTML content if provided as string -->
    {#if metadata?.html}
      {@html metadata.html}
    {/if}
  {/if}
  
  {#if faqs.length > 0}
    <div class="not-prose mt-16">
      <FAQ items={faqs} />
    </div>
  {/if}
</section>