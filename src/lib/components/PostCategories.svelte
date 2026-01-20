<script>
  
  /**
   * @typedef {Object} Props
   * @property {{ post: { metadata: { categories?: string[] } } }} post
   */

  /** @type {Props} */
  const { post } = $props();

  // Get categories
  const categories = $derived.by(() => post.metadata.categories ?? []);
</script>

{#if categories.length > 0}
  <div class="flex items-center gap-2">
    <ul class="flex flex-wrap gap-2 text-sm">
      {#each categories as category (category)}
        <li>
          <a
            href={`/blog/category/${encodeURIComponent(category)}`}
            class="px-3 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-full border border-sky-100 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors font-medium"
          >
            {category}
          </a>
        </li>
      {/each}
    </ul>
  </div>
{:else}
  <p class="text-sm text-gray-500 italic px-4">Chưa phân loại</p>
{/if}
