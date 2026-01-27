<script>
  import { siteConfig } from '$lib/config';
  import FAQ from './FAQ.svelte';

  // Receive `data` prop from parent load() result
  // (We access it defensively to avoid runtime errors during prerender)
  const { data } = $props() || {};
  const PageContent = data?.content || null;
  const metadata = data?.metadata || {};

  // FAQs array (may be undefined)
  const faqs = Array.isArray(metadata?.faqs) ? metadata.faqs : [];

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
</svelte:head>

<section class="prose prose-gray dark:prose-invert max-w-3xl mx-auto px-4 py-10 prose-headings:text-gray-950 dark:prose-headings:text-white prose-p:text-gray-800 dark:prose-p:text-gray-200">
  <PageContent />

  
  {#if faqs.length > 0}
    <div class="not-prose mt-16">
      <FAQ items={faqs} />
    </div>
  {/if}
</section>
