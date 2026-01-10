<script>
  import { onMount, tick } from 'svelte';
  import { siteConfig } from '$lib/config';
  import PostDate from '$lib/components/PostDate.svelte';
  import PostAuthor from '$lib/components/PostAuthor.svelte';
  import PostCategories from '$lib/components/PostCategories.svelte';
  import PostTags from '$lib/components/PostTags.svelte';
  import LikeAndShare from '$lib/components/LikeAndShare.svelte';
  import ToC from '$lib/components/ToC.svelte';

  const { data } = $props();
  const { content: PostContent, metadata } = $derived.by(() => data);
  
  let articleRef = $state();
  let tocRef = $state();
  
  // 🎯 Auto-position TOC after intro or before first heading
  onMount(async () => {
    await tick();
    
    if (!articleRef || !tocRef || !metadata?.toc || metadata.toc.length === 0) return;
    
    const firstHeading = articleRef.querySelector('h1, h2, h3, h4, h5, h6');
    if (!firstHeading) return;
    
    let currentElement = articleRef.firstElementChild;
    let hasIntroContent = false;
    let lastIntroElement = null;
    
    while (currentElement && currentElement !== firstHeading) {
      const text = currentElement.textContent?.trim() || '';
      
      if (currentElement.contains(tocRef)) {
        currentElement = currentElement.nextElementSibling;
        continue;
      }
      
      if (text.length > 30) {
        hasIntroContent = true;
        lastIntroElement = currentElement;
      }
      
      currentElement = currentElement.nextElementSibling;
    }
    
    if (hasIntroContent && lastIntroElement) {
      lastIntroElement.after(tocRef);
    } else {
      firstHeading.before(tocRef);
    }
  });
</script>

<svelte:head>
  {#if metadata}
    <title>
      {metadata.title ? `${metadata.title} — ${siteConfig.title}` : siteConfig.title}
    </title>
    <meta name="description" content={metadata.description ?? siteConfig.description} />
  {/if}
</svelte:head>

<div class="max-w-2xl mx-auto lg:max-w-none px-4 sm:px-6">
  <div class="w-full mx-auto overflow-x-hidden">
    {#if metadata}
      <article class="max-w-3xl mx-auto px-4 py-10">
        <!-- Title -->
        <h1 class="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
          {metadata.title}
        </h1>

        <!-- Meta (date, author, category) -->
        <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <PostAuthor post={{ metadata }} />
          <span aria-hidden="true">•</span>
          <PostDate post={{ metadata }} />
          <span aria-hidden="true">•</span>
          <PostCategories post={{ metadata }} />
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Đọc trong {metadata.readingTime} phút
        </p>

        <!-- Like & Share -->
        <div class="mt-8 flex justify-between items-center">
          <LikeAndShare />
        </div>

        <!-- Post content -->
        <section bind:this={articleRef} class="prose prose-gray dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-sky-600 dark:prose-a:text-sky-400 prose-img:rounded-lg prose-img:shadow-md">
          <!-- ✅ ToC will auto-insert into article content -->
          <div bind:this={tocRef}>
            <ToC post={{ metadata }} />
          </div>
          <PostContent />
        </section>

        <!-- Tags -->
        <div class="mt-10 border-t border-gray-200 dark:border-gray-700 pt-6">
          <PostTags post={{ metadata }} />
        </div>
      </article>
    {/if}
  </div>
</div>