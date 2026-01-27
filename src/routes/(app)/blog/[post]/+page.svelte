<script>
  import { siteConfig } from '$lib/config';
  import PostDate from '$lib/components/PostDate.svelte';
  import PostAuthor from '$lib/components/PostAuthor.svelte';
  import PostCategories from '$lib/components/PostCategories.svelte';
  import PostTags from '$lib/components/PostTags.svelte';
  import LikeAndShare from '$lib/components/LikeAndShare.svelte';
  import ToC from '$lib/components/ToC.svelte';
  import FAQ from '$lib/components/FAQ.svelte';
  import PostNavigation from '$lib/components/PostNavigation.svelte';
  import Seo from 'sk-seo';
  import { getSeoConfig } from '$lib/utils/seo';
  import { page } from '$app/state';

  const { data } = $props();
  const { content: PostContent, metadata } = $derived.by(() => data);

  const faqs = $derived(metadata?.faqs || []);

  const seoConfig = $derived(getSeoConfig({
    title: metadata?.title,
    description: metadata?.description,
    url: page.url.pathname,
    image: metadata?.image
  }));
</script>

<svelte:head>
  {#if metadata}
    <Seo {...seoConfig} />
  {/if}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6">
  {#if metadata}
    <article class="py-10 animate-fade-in">
      <header class="mb-10 space-y-6">
        <!-- Title -->
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 dark:text-white leading-tight tracking-tight text-balance">
          {metadata.title}
        </h1>

        <!-- Meta info -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
          <PostAuthor post={{ metadata }} />
          <span aria-hidden="true" class="text-gray-300 dark:text-gray-700">|</span>
          <PostDate post={{ metadata }} />
          <span aria-hidden="true" class="text-gray-300 dark:text-gray-700">|</span>
          <PostCategories post={{ metadata }} />
          <span aria-hidden="true" class="text-gray-300 dark:text-gray-700">|</span>
          <span class="font-bold text-gray-950 dark:text-gray-200">{metadata.readingTime} phút đọc</span>
        </div>

        {#if metadata.description}
          <div class="p-8 bg-sky-50/50 dark:bg-sky-900/10 border-l-4 border-sky-800 dark:border-sky-400 rounded-r-[2rem] shadow-sm">
            <p class="text-sky-950 dark:text-sky-100 italic leading-relaxed font-bold text-lg">
              {metadata.description}
            </p>
          </div>
        {/if}
        
        <div class="flex items-center pt-2">
          <LikeAndShare />
        </div>
      </header>

      <!-- Fixed TOC position to prevent Layout Shift -->
      {#if metadata.toc && metadata.toc.length > 0}
        <div class="not-prose mb-10">
          <ToC post={{ metadata }} />
        </div>
      {/if}

      <!-- Post content -->
      <section class="prose prose-gray dark:prose-invert max-w-none prose-headings:font-black prose-headings:text-gray-950 dark:prose-headings:text-white prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-a:text-sky-800 dark:prose-a:text-sky-400 prose-a:font-bold prose-img:rounded-[2rem] prose-img:shadow-2xl">
        <PostContent />
      </section>

      {#if faqs.length > 0}
        <div class="mt-20 not-prose">
          <FAQ items={faqs} />
        </div>
      {/if}

      <footer class="mt-16 space-y-10">
        <!-- Tags -->
        <div class="pt-8 border-t border-gray-100 dark:border-gray-800">
          <PostTags post={{ metadata }} />
        </div>
        
        <PostNavigation post={{ metadata }} />
      </footer>
    </article>
  {/if}
</div>