<script>
  import { siteConfig } from '$lib/config'
  import SEO from '$lib/components/SEO.svelte'
  import { getSeoConfig } from '$lib/utils/seo'

  const { data } = $props()
  const { uniqueCategories, totalCategories } = $derived.by(() => data)

  const seoConfig = $derived(
    getSeoConfig({
      title: 'Danh mục bài viết',
      description: `Khám phá ${totalCategories || 0} danh mục bài viết trên ${siteConfig.title}`,
      url: '/blog/category'
    })
  )
</script>

<SEO {...seoConfig} />

<div class="container mx-auto px-4 py-16">
  <div class="mx-auto max-w-3xl">
    <!-- Title -->
    <h1 class="mb-10 text-center text-4xl text-gray-950 font-black dark:text-gray-50">
      Tất cả danh mục
      <span class="text-2xl text-gray-950 dark:text-gray-50"> ({totalCategories || 0}) </span>
    </h1>

    <!-- Category list -->
    {#if uniqueCategories?.length > 0}
      <ul class="list-none divide-y divide-gray-200 dark:divide-gray-700">
        {#each uniqueCategories as category (category.slug)}
          <li class="py-4">
            <a
              href={`/blog/category/${category.slug}`}
              class="group flex items-center justify-between rounded-lg px-4 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <!-- Category name with count (WordPress style) -->
              <span
                class="text-lg text-blue-800 font-black dark:text-blue-300 group-hover:underline"
              >
                {category.title} ({category.count})
              </span>
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-center text-lg text-gray-950 font-bold italic dark:text-gray-50">
        Chưa có danh mục nào được gắn cho bài viết.
      </p>
    {/if}
  </div>
</div>
