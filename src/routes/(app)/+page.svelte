<script>
  import PageContent from '$lib/components/PageContent.svelte';
  import RecentPosts from '$lib/components/RecentPosts.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import { siteConfig } from '$lib/config';
  import { serializeSchema } from '$lib/utils/seo';

  let { data } = $props();
  
  // Logic: Just use posts from data. Home posts are fetched at build time (static)
  const recentPosts = $derived(data?.recentPosts || []);

  // SEO Config
  const seoTitle = $derived(data.metadata?.title || siteConfig.title);
  const seoDescription = $derived(data.metadata?.description || siteConfig.description);

  // Structured Data (JSON-LD)
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': siteConfig.title,
    'description': siteConfig.description,
    'url': siteConfig.siteUrl,
    'author': {
      '@type': 'Person',
      'name': siteConfig.author.name
    }
  };
</script>

<SEO 
  title={seoTitle} 
  description={seoDescription}
  canonical={siteConfig.siteUrl}
  openGraph={{
    type: 'website',
    title: seoTitle,
    description: seoDescription,
    site_name: siteConfig.title
  }}
/>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html serializeSchema(websiteSchema)}
</svelte:head>

<div class="space-y-16">
  <!-- Personal Intro Section (Hero) - Clean & Focused -->
  <section class="py-12 border-b border-gray-100 dark:border-gray-800">
    <div class="max-w-none">
      <PageContent {data} />
    </div>
  </section>

  <!-- Latest Section - Simple List -->
  {#if recentPosts.length > 0}
    <section class="space-y-12">
      <div class="flex items-center gap-4">
        <h2 class="text-xs font-black tracking-[0.3em] text-gray-950 dark:text-gray-50">
          bài viết mới
        </h2>
        <div class="h-px flex-grow bg-gray-100 dark:bg-gray-800"></div>
      </div>
      
      <RecentPosts recentPosts={recentPosts} />
      
      <div class="pt-8">
        <a href="/blog" data-sveltekit-preload-data="hover" class="inline-flex px-8 py-4 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-black text-sm hover:scale-105 transition-transform shadow-xl">
          Khám phá toàn bộ bài viết
        </a>
      </div>
    </section>
  {/if}
</div>
