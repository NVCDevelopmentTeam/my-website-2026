<script>
  import RecentPosts from './RecentPosts.svelte'
  import SocialMenu from './SocialMenu.svelte'
  
  /** @type {Object} Props */
  let { recentPosts = [], categories = [] } = $props()
  
  // Process recent posts
  const processedRecentPosts = $derived.by(() => {
    return recentPosts.map(post => {
      const metadata = post.metadata || post
      
      return {
        slug: post.slug || metadata.slug,
        metadata: {
          title: metadata.title,
          date: metadata.date,
          preview: metadata.preview || metadata.description || '',
          description: metadata.description,
          readingTime: metadata.readingTime,
          image: metadata.image,
          categories: metadata.categories || [],
          tags: metadata.tags || []
        }
      }
    })
  })
  
  // Process categories
  const processedCategories = $derived.by(() => {
    return categories.map(cat => {
      if (cat.metadata) {
        return {
          title: cat.metadata.title,
          slug: cat.metadata.slug,
          count: cat.metadata.count
        }
      }
      
      return {
        title: cat.title || cat.name,
        slug: cat.slug,
        count: cat.count
      }
    })
  })
  
  const hasRecentPosts = $derived(processedRecentPosts.length > 0)
  const hasCategories = $derived(processedCategories.length > 0)
</script>

<aside class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
  <!-- Recent Posts -->
  {#if hasRecentPosts}
    <section 
      class="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-full"
    >
      <h2 
        id="recent-posts-heading"
        class="text-lg font-black text-gray-950 dark:text-gray-50 mb-4"
      >
        bài viết gần đây
      </h2>
      <RecentPosts recentPosts={processedRecentPosts} />
    </section>
  {/if}

  <!-- Categories (WordPress style) -->
  {#if hasCategories}
    <section 
      class="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-full"
    >
      <h2 
        id="categories-heading"
        class="text-lg font-black text-gray-950 dark:text-gray-50 mb-4"
      >
        xem theo danh mục
      </h2>
      <ul class="space-y-1">
        {#each processedCategories as category (category.slug)}
          <li>
            <a 
              href="/blog/category/{category.slug}"
              
              class="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <span class="text-sm font-bold text-gray-950 dark:text-gray-50 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                {category.title}
              </span>
              <span class="text-xs text-gray-950 dark:text-gray-50">
                ({category.count})
              </span>
            </a>
          </li>
        {/each}
      </ul>
      
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <a 
          href="/blog/category"
          
          class="text-sm font-bold text-blue-800 dark:text-blue-300 hover:underline inline-flex items-center gap-1"
        >
          Xem tất cả danh mục →
        </a>
      </div>
    </section>
  {/if}

  <!-- Social -->
  <section class="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-full">
    <SocialMenu />
  </section>
</aside>
