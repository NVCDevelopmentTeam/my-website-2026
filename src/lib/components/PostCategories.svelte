<script>
  import { slugify } from '$lib/utils/slugify'

  /**
   * @typedef {Object} Props
   * @property {{ metadata: { categories?: (string | { title: string, slug: string })[] } }} post
   */

  /** @type {Props} */
  const { post } = $props()

  // Process categories - handle both string and object formats
  const categories = $derived.by(() => {
    const rawCategories = post?.metadata?.categories ?? []

    return rawCategories
      .filter((cat) => cat) // Remove null/undefined
      .map((cat) => {
        // Case 1: String category
        if (typeof cat === 'string') {
          return {
            title: cat.trim(),
            slug: slugify(cat.trim())
          }
        }

        // Case 2: Object with title and slug
        if (cat.title) {
          return {
            title: cat.title.trim(),
            slug: cat.slug || slugify(cat.title.trim())
          }
        }

        // Case 3: Object with metadata
        if (cat.metadata?.title) {
          return {
            title: cat.metadata.title.trim(),
            slug: cat.metadata.slug || slugify(cat.metadata.title.trim())
          }
        }

        return null
      })
      .filter(Boolean) // Remove invalid categories
  })
</script>

{#if categories.length > 0}
  <div class="flex items-center gap-2 font-bold text-gray-950 dark:text-gray-50">
    <span class="text-sm">danh mục:</span>
    <ul class="flex flex-wrap gap-2 text-sm">
      {#each categories as category (category.slug)}
        <li>
          <a
            href={`/blog/category/${category.slug}`}
            class="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-bold text-sky-900 transition-colors hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300 dark:hover:bg-sky-900/50"
          >
            {category.title}
          </a>
        </li>
      {/each}
    </ul>
  </div>
{:else}
  <p class="px-4 text-sm text-gray-950 italic dark:text-gray-50">Chưa phân loại</p>
{/if}
