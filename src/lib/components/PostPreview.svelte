<script>
  /**
   * PostPreview - Only shows excerpt/description
   * Other info (title, date, categories, tags) should be in separate components
   * 
   * @typedef {Object} Post
   * @property {string} slug
   * @property {Object} metadata
   * @property {string} metadata.title
   * @property {string} metadata.description
   * @property {string} metadata.date
   * @property {string[]} metadata.tags
   * @property {string[]} metadata.categories
   * @property {number} metadata.readingTime
   */
  
  /** @type {{ post: Post }} */
  let { post } = $props();
  
  // Svelte 5: Use $derived for reactive computations from props
  const description = $derived(post?.metadata?.description || '');
  
  // Check if valid excerpt (not frontmatter, not empty, not fallback message)
  const hasValidExcerpt = $derived(
    description && 
    description.trim().length > 0 && 
    !description.startsWith('title:') && // Not frontmatter YAML
    !description.startsWith('---') && // Not frontmatter delimiter
    description !== 'Bài viết chưa có mô tả.'
  );
  
  // ✅ FIX: Add parentheses for $derived
  const postUrl = $derived(`/blog/${post?.slug}`);
</script>

<div class="mb-4">
  {#if hasValidExcerpt}
    <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
      {description}
      <a
        href={postUrl}
        class="ml-2 text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded transition-colors"
        aria-label={`Đọc toàn bộ bài viết ${post?.metadata?.title || post?.slug}`}
      >
        Đọc thêm →
      </a>
    </p>
  {:else}
    <p class="text-gray-500 dark:text-gray-400 italic leading-relaxed">
      Bài viết chưa có mô tả.
      <a
        href={postUrl}
        class="ml-2 text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded transition-colors"
        aria-label={`Đọc bài viết ${post?.metadata?.title || post?.slug}`}
      >
        Xem bài viết →
      </a>
    </p>
  {/if}
</div>