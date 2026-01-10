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
  <p class="text-sm text-gray-600 dark:text-gray-400">Danh mục:</p>

  <ul class="flex flex-wrap gap-2 text-sm mt-1">
    {#each categories as category (category)}
      <li>
        <a
          href={`/blog/category/${encodeURIComponent(category)}`}
          class="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {category}
        </a>
      </li>
    {/each}
  </ul>
{:else}
  <p class="text-sm text-gray-500 italic">Chưa phân loại</p>
{/if}
