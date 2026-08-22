<script>
  import { siteConfig } from '$lib/config'
  import SEO from '$lib/components/SEO.svelte'
  import { getSeoConfig } from '$lib/utils/seo'

  const { data } = $props()
  const { tags, totalTags } = $derived.by(() => data)

  const seoConfig = $derived(
    getSeoConfig({
      title: 'Tất cả thẻ',
      description: `Khám phá ${totalTags || 0} thẻ bài viết trên ${siteConfig.title}`,
      url: '/blog/tag'
    })
  )
</script>

<SEO {...seoConfig} />

<div class="container mx-auto px-4 py-16">
  <div class="mx-auto max-w-3xl">
    <!-- Title -->
    <h1 class="mb-10 text-center text-4xl font-black text-gray-950 dark:text-gray-50">
      Tất cả thẻ
      <span class="text-2xl text-gray-950 dark:text-gray-50"> ({totalTags || 0}) </span>
    </h1>

    <!-- Tags cloud (WordPress style) -->
    {#if tags?.length > 0}
      <div class="flex flex-wrap justify-center gap-3">
        {#each tags as tag (tag.slug)}
          <a
            href={`/blog/tag/${tag.slug}`}
            class="group inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-bold text-purple-950 transition-all duration-200 hover:border-purple-300 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-200 dark:hover:border-purple-700 dark:hover:bg-purple-900/50"
          >
            <svg
              class="h-4 w-4 text-purple-800 dark:text-purple-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="transition-transform group-hover:scale-105">
              {tag.name}
            </span>
            <span
              class="rounded-full bg-purple-200 px-2 py-0.5 text-xs font-black text-purple-950 dark:bg-purple-900/60 dark:text-purple-50"
            >
              {tag.count}
            </span>
          </a>
        {/each}
      </div>
    {:else}
      <p class="text-center text-lg font-bold text-gray-950 italic dark:text-gray-50">
        Chưa có thẻ nào được gắn cho bài viết.
      </p>
    {/if}
  </div>
</div>
