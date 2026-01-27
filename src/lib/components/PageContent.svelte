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
<section class="prose prose-gray dark:prose-invert max-w-3xl mx-auto px-4 py-10 prose-headings:text-gray-950 dark:prose-headings:text-white prose-p:text-gray-800 dark:prose-p:text-gray-200">
  <PageContent />
>>>>>>> Stashed changes
  
  {#if faqs.length > 0}
    <div class="not-prose mt-16">
      <FAQ items={faqs} />
    </div>
  {/if}
</section>
