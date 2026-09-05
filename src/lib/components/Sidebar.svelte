<script>
  import RecentPosts from './RecentPosts.svelte'
  import SocialMenu from './SocialMenu.svelte'
  import { page } from '$app/state'

  /**
   * Sidebar Component - Displays Recent Posts, Categories, and Social / Exploration widgets.
   * Uses Svelte 5 runes ($props, $derived) for reactive updates.
   */
  let { recentPosts = [], categories = [] } = $props()

  // Process recent posts for sidebar display
  const processedRecentPosts = $derived(
    Array.isArray(recentPosts)
      ? recentPosts.map((post) => {
          const metadata = post?.metadata || post || {}
          return {
            slug: post?.slug || metadata.slug || '',
            metadata: {
              title: metadata.title || post?.title || 'Không có tiêu đề',
              date: metadata.date || null,
              preview: metadata.preview || metadata.description || '',
              description: metadata.description || '',
              readingTime: metadata.readingTime || 5,
              image: metadata.image || null,
              categories: metadata.categories || [],
              tags: metadata.tags || []
            }
          }
        })
      : []
  )

  // Process categories for category list
  const processedCategories = $derived(
    Array.isArray(categories)
      ? categories.map((cat) => {
          if (cat?.metadata) {
            return {
              title: cat.metadata.title || 'Chưa phân loại',
              slug: cat.metadata.slug || '',
              count: cat.metadata.count || 0
            }
          }
          return {
            title: cat?.title || cat?.name || 'Chưa phân loại',
            slug: cat?.slug || '',
            count: cat?.count || 0
          }
        })
      : []
  )

  const currentPath = $derived(page?.url?.pathname || '')
</script>

<aside class="flex flex-col gap-6">
  <!-- Recent Posts Widget -->
  <section
    class="border border-gray-200 rounded-2xl bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
  >
    <div
      class="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800"
    >
      <h2 class="text-xs text-gray-950 font-black tracking-widest uppercase dark:text-gray-50">
        Bài viết gần đây
      </h2>
    </div>
    <RecentPosts recentPosts={processedRecentPosts} />
  </section>

  <!-- Categories Widget -->
  {#if processedCategories.length > 0}
    <section
      class="border border-gray-200 rounded-2xl bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div
        class="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800"
      >
        <h2 class="text-xs text-gray-950 font-black tracking-widest uppercase dark:text-gray-50">
          Danh mục
        </h2>
      </div>
      <ul class="list-none space-y-1.5">
        {#each processedCategories as category (category.slug || category.title)}
          {@const isActive = currentPath.includes(`/blog/category/${category.slug}`)}
          <li>
            <a
              href="/blog/category/{category.slug}"
              data-sveltekit-preload-data="hover"
              class="group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 {isActive
                ? 'bg-sky-50 text-sky-700 font-black dark:bg-sky-950/50 dark:text-sky-300'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 hover:text-sky-700 dark:hover:bg-gray-800 dark:hover:text-sky-300'}"
            >
              <span class="text-sm font-semibold transition-transform group-hover:translate-x-0.5">
                {category.title}
              </span>
              <span
                class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 font-bold dark:bg-gray-800 group-hover:bg-sky-100 dark:text-gray-400 group-hover:text-sky-800 dark:group-hover:bg-sky-900/60 dark:group-hover:text-sky-200"
              >
                {category.count}
              </span>
            </a>
          </li>
        {/each}
      </ul>

      <div class="mt-4 border-t border-gray-100 pt-3 dark:border-gray-800">
        <a
          href="/blog/category"
          data-sveltekit-preload-data="hover"
          class="inline-flex items-center gap-1.5 text-xs text-sky-700 font-black tracking-wider uppercase dark:text-sky-400 hover:underline"
        >
          <span>Khám phá tất cả danh mục</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  {/if}

  <!-- Social & Quick Connect Widget -->
  <section
    class="border border-gray-200 rounded-2xl bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
  >
    <SocialMenu />
  </section>
</aside>
