<script>
  import { siteConfig } from '$lib/config'
  import PostsList from '$lib/components/PostsList.svelte'
  import Pagination from '$lib/components/Pagination.svelte'
  import SEO from '$lib/components/SEO.svelte'
  import { getSeoConfig } from '$lib/utils/seo'

  // Get data from server
  let { data } = $props()

  // Always fallback to avoid SSR errors
  let posts = $derived(data?.posts ?? [])

  // SEO configuration
  const seoConfig = getSeoConfig({
    title: 'Blog',
    description: siteConfig.description,
    url: '/blog'
  })
</script>

<SEO {...seoConfig} />

<section class="px-4 py-12">
  <h1 class="mb-16 text-center text-4xl font-black tracking-tight sm:text-5xl">
    <span
      class="bg-gradient-to-r from-sky-800 to-violet-950 bg-clip-text text-transparent dark:from-sky-400 dark:to-violet-400"
    >
      Blog
    </span>
  </h1>

  {#if posts.length > 0}
    <!-- Post list -->
    <PostsList {posts} />

    <!-- Pagination - pass data.pagination from server -->
    <div class="mt-12">
      <Pagination pagination={data.pagination} />
    </div>
  {:else}
    <p class="text-center text-lg font-bold text-gray-950 italic dark:text-gray-50">
      Chưa có bài viết nào được đăng.
    </p>
  {/if}
</section>
