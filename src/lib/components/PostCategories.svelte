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
  <div class="flex items-center gap-2">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      class="text-gray-700 dark:text-gray-400 flex-shrink-0" 
      aria-hidden="true"
    >
      <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-6"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
      <path d="M7 16.5 8 22l-3-1-3 1 1-5.5"></path>
    </svg>
    
    <ul class="flex flex-wrap gap-2 text-sm">
      {#each categories as category (category.slug)}
        <li>
          <a
            href={`/blog/category/${category.slug}`}
            class="px-3 py-1 bg-sky-50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-300 rounded-full border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors font-bold inline-block"
          >
            {category.title}
          </a>
        </li>
      {/each}
    </ul>
  </div>
{:else}
  <div class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400 italic">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      class="flex-shrink-0"
      aria-hidden="true"
    >
      <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-6"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <path d="M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
      <path d="M7 16.5 8 22l-3-1-3 1 1-5.5"></path>
    </svg>
    <span>Chưa phân loại</span>
  </div>
{/if}

