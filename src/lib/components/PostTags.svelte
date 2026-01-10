<script>
  
  /**
   * @typedef {Object} Props
   * @property {{ post: { metadata: { tags?: string[] } } }} post
   */

  /** @type {Props} */
  const { post } = $props();

  // Get tags array from post.metadata
  const tags = $derived.by(() => post.metadata.tags ?? []);
</script>

{#if tags.length > 0}
  <div class="flex flex-wrap gap-2 items-center">
    <p class="text-sm text-gray-600 mr-2">Từ khóa:</p>
    {#each tags as tag (tag)}
      <a 
        href={`/blog/tag/${encodeURIComponent(tag)}`} 
        class="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      >
        {tag}
      </a>
    {/each}
  </div>
{/if}
