<script>
  import { slugify } from '$lib/utils/slugify'

  /**
   * @typedef {Object} Props
   * @property {{ metadata: { tags?: string[] } }} post
   */

  /** @type {Props} */
  const { post } = $props()

  // Get tags from post metadata
  const tags = $derived.by(() => {
    const rawTags = post?.metadata?.tags ?? []
    return rawTags
      .filter((tag) => tag && tag.trim())
      .map((tag) => ({
        name: tag.trim(),
        title: tag.trim(), // Ensure title is set for display
        slug: slugify(tag.trim())
      }))
  })
</script>

{#if tags.length > 0}
  <div class="flex items-center gap-2 font-bold text-gray-950 dark:text-gray-50">
    Thẻ
    <svg class="h-4 w-4 text-gray-950 dark:text-gray-50" fill="currentColor" viewBox="0 0 20 20">
      <path
        fill-rule="evenodd"
        d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
        clip-rule="evenodd"
      />
    </svg>
    <ul class="flex flex-wrap gap-2 text-sm">
      {#each tags as tag (tag.slug)}
        <li>
          <a
            href={`/blog/tag/${tag.slug}`}
            data-sveltekit-preload-data="hover"
            class="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 font-bold text-purple-900 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
          >
            {tag.title}
          </a>
        </li>
      {/each}
    </ul>
  </div>
{:else}
  <p class="text-sm text-gray-950 italic dark:text-gray-50">Chưa có thẻ</p>
{/if}
