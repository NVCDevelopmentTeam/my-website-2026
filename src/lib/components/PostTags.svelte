<script>
  import { slugify } from '$lib/utils/slugify';

  /**
   * @typedef {Object} Props
   * @property {{ metadata: { tags?: string[] } }} post
   */

  /** @type {Props} */
  const { post } = $props();

  // Get tags from post metadata
  const tags = $derived.by(() => {
    const rawTags = post?.metadata?.tags ?? [];
    return rawTags
      .filter(tag => tag && tag.trim())
      .map(tag => ({
        title: tag.trim(),
        slug: slugify(tag.trim())
      }));
  });
</script>

{#if tags.length > 0}
  <div class="flex items-center gap-2">
    <svg class="w-4 h-4 text-gray-700 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
    </svg>
    <ul class="flex flex-wrap gap-2 text-sm" aria-label="Thẻ bài viết">
      {#each tags as tag (tag.slug)}
        <li>
          <a
            href={`/blog/tag/${tag.slug}`}
            class="px-3 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors font-bold"
          >
            {tag.title}
          </a>
        </li>
      {/each}
    </ul>
  </div>
{:else}
  <p class="text-sm text-gray-800 dark:text-gray-400 italic">Chưa có tags</p>
{/if}

