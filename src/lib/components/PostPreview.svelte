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
    description !== 'Chưa có mô tả.'
  );
  
  const postUrl = $derived(`/blog/${post?.slug}`);
</script>

<div class="mb-4">
  {#if hasValidExcerpt}
    <p class="text-gray-800 dark:text-gray-200 leading-relaxed">
      {description}
      <a
        href={postUrl}
        class="ml-2 text-sky-800 dark:text-sky-400 font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-sky-700 dark:focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-gray-950 rounded transition-colors"
        aria-label={`Đọc toàn bộ bài viết: ${post?.metadata?.title || post?.slug}`}
      >
        Đọc thêm →
      </a>
    </p>
  {:else}
    <p class="text-gray-800 dark:text-gray-400 italic leading-relaxed">
      Chưa có mô tả.
      <a
        href={postUrl}
        class="ml-2 text-sky-800 dark:text-sky-400 font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-sky-700 dark:focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-gray-950 rounded transition-colors"
        aria-label={`Xem bài viết: ${post?.metadata?.title || post?.slug}`}
      >
        Xem bài →
      </a>
    </p>
  {/if}
</div>

