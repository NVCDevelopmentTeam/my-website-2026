<script>
  import { page } from '$app/state'
  import { siteConfig } from '$lib/config'
  import FAQ from './FAQ.svelte'
  import SEO from './SEO.svelte'
  import { getSeoConfig } from '$lib/utils/seo'

  // Receive `data` prop from parent load() result
  let { data } = $props()

  const PageContent = $derived(data?.content || null)
  const metadata = $derived(data?.metadata || {})

  // FAQs array (may be undefined)
  const faqs = $derived(Array.isArray(metadata?.faqs) ? metadata.faqs : [])

  // SEO configuration
  const seoConfig = $derived(
    getSeoConfig({
      title: metadata?.title || siteConfig.title,
      description: metadata?.description || siteConfig.description,
      url: page.url.pathname
    })
  )
</script>

<SEO {...seoConfig} />

<section
  class="prose max-w-none px-4 py-10 prose-neutral dark:prose-invert
  [&_h1]:text-gray-950 [&_h2]:text-gray-950 [&_h3]:text-gray-950 [&_h4]:text-gray-950
  dark:[&_h1]:text-white dark:[&_h2]:text-white dark:[&_h3]:text-white dark:[&_h4]:text-white
  [&_p]:text-gray-950 dark:[&_p]:text-gray-50
  [&_a]:font-bold [&_a]:text-sky-900 dark:[&_a]:text-sky-400
  [&_strong]:text-gray-950 dark:[&_strong]:text-white
  [&_ol]:text-gray-950 dark:[&_ol]:text-gray-50
  [&_ul]:text-gray-950 dark:[&_ul]:text-gray-50
  [&_li]:text-gray-950 dark:[&_li]:text-gray-50"
>
  {#if PageContent}
    <PageContent />
  {/if}

  {#if faqs.length > 0}
    <div class="not-prose mt-16">
      <FAQ items={faqs} />
    </div>
  {/if}
</section>
