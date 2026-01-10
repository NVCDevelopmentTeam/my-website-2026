<script>
  import { siteConfig } from '$lib/config';
  import PostsList from '$lib/components/PostsList.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  let { data } = $props();

  // Reactive in Svelte 5 style
  let tag = $derived(data.tag);
  let posts = $derived(data.posts);
  let pagination = $derived(data.pagination);

  // SEO like WordPress Archive
  const metadata = $derived.by(() => ({
    title: `Thẻ: ${tag}`,
    description: `Các bài viết được gắn thẻ "${tag}" trên ${siteConfig.title}.`
  }));
</script>

<svelte:head>
  <title>
    {metadata.title
      ? `${metadata.title} – ${siteConfig.title}`
      : siteConfig.title}
  </title>
  <meta
    name="description"
    content={metadata.description ?? siteConfig.description}
  />
</svelte:head>

<section class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white capitalize">
      {metadata.title}
    </h1>

  {#if posts.length > 0}
    <!-- Post list -->
    <PostsList {posts} />

    <!-- Pagination -->
    {#if pagination.totalPages > 1}
      <div class="mt-10">
<Pagination
  currentPage={pagination.currentPage}
  totalPosts={pagination.totalPosts}
  baseUrl={`/blog/tag/${tag}`}
/>
      </div>
    {/if}
  {:else}
    <p class="text-center text-gray-600 dark:text-gray-400 italic">
      Chưa có bài viết nào dùng thẻ này.
    </p>
  {/if}
</section>
