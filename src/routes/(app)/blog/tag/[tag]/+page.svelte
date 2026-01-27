<script>
  import { siteConfig } from '$lib/config';
  import PostsList from '$lib/components/PostsList.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import Seo from 'sk-seo';
  import { getSeoConfig } from '$lib/utils/seo';
  import { page } from '$app/state';

  let { data } = $props();

  // Reactive in Svelte 5 style - only extract tag and posts
  let tag = $derived(data.tag); // Tag object: { name, slug, count, description, title }
  let posts = $derived(data.posts);

  const seoConfig = $derived(getSeoConfig({
    title: `Thẻ: ${tag?.title || 'Không xác định'}`,
    description: tag?.description || `Các bài viết được gắn thẻ "${tag?.title || 'này'}" trên ${siteConfig.title}.`,
    url: page.url.pathname
  }));
</script>

<svelte:head>
  <Seo {...seoConfig} />
</svelte:head>

<section class="max-w-4xl mx-auto px-4 py-12">
  <!-- Tag header with icon -->
  <div class="mb-8">
    <div class="flex items-center gap-2 mb-2">
      <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
      </svg>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Thẻ: {tag?.title || ''}
      </h1>
    </div>
    
    {#if tag?.count}
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {tag.count} bài viết
      </p>
    {/if}
  </div>

  {#if posts?.length > 0}
    <!-- Post list -->
    <PostsList {posts} />

    <!-- Pagination - pass data.metadata from server -->
    <div class="mt-10">
      <Pagination metadata={data.metadata} />
    </div>
  {:else}
    <p class="text-center text-gray-600 dark:text-gray-400 italic mt-8">
      Chưa có bài viết nào dùng thẻ này.
    </p>
  {/if}
</section>