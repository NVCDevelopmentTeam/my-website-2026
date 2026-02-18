<script>
  import { slugify } from '$lib/utils/slugify';

  /**
   * @typedef {Object} Props
   * @property {{ metadata: { categories?: (string | { title: string, slug: string })[] } }} post
   */

  /** @type {Props} */
  const { post } = $props();

  // Process categories - handle both string and object formats
  const categories = $derived.by(() => {
    const rawCategories = post?.metadata?.categories ?? [];
    
    return rawCategories
      .filter(cat => cat) // Remove null/undefined
      .map(cat => {
        // Case 1: String category
        if (typeof cat === 'string') {
          return {
            title: cat.trim(),
            slug: slugify(cat.trim())
          };
        }
        
        // Case 2: Object with title and slug
        if (cat.title) {
          return {
            title: cat.title.trim(),
            slug: cat.slug || slugify(cat.title.trim())
          };
        }
        
        // Case 3: Object with metadata
        if (cat.metadata?.title) {
          return {
            title: cat.metadata.title.trim(),
            slug: cat.metadata.slug || slugify(cat.metadata.title.trim())
          };
        }
        
        return null;
      })
      .filter(Boolean); // Remove invalid categories
  });
</script>

{#if categories.length > 0}
  <div class="flex items-center gap-2 text-gray-950 dark:text-gray-50 font-bold">
    <span class="text-sm">danh mục:</span>
    <ul class="flex flex-wrap gap-2 text-sm">
      {#each categories as category (category.slug)}
        <li>
          <a
            href={`/blog/category/${category.slug}`}
            
            class="px-3 py-1 bg-sky-50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-300 rounded-full border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors font-bold"
          >
            {category.title}
          </a>
        </li>
      {/each}
    </ul>
  </div>
{:else}
  <p class="text-sm text-gray-950 dark:text-gray-50 italic px-4">Chưa phân loại</p>
{/if}
