<script>
  // Accept both formats: individual props or post object
  let { 
    post = undefined,
    prevPost: propPrevPost = undefined, 
    nextPost: propNextPost = undefined 
  } = $props();

  // Auto-extract from post object or use direct props
  // Now supports post={{ metadata }} where metadata.prevPost and metadata.nextPost exist
  const prevPost = $derived(
    propPrevPost || 
    post?.prevPost || 
    post?.metadata?.prevPost
  );
  
  const nextPost = $derived(
    propNextPost || 
    post?.nextPost || 
    post?.metadata?.nextPost
  );
</script>

{#if prevPost || nextPost}
  <!-- WordPress-style simple navigation -->
  <nav class="border-t border-gray-100 dark:border-gray-800 mt-12 pt-8" aria-label="Điều hướng bài viết">
    <h2 class="sr-only">Điều hướng bài viết</h2>
    
    <div class="flex flex-col sm:flex-row justify-between items-stretch gap-6">
      
      <!-- Previous Post -->
      <div class="flex-1">
        {#if prevPost}
          <div class="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-400 mb-2">← Bài trước</div>
          <a 
            href={`/blog/${prevPost.slug}`}
            class="text-lg font-bold text-sky-800 dark:text-sky-400 hover:underline line-clamp-2 leading-snug"
          >
            {prevPost.title}
          </a>
        {/if}
      </div>

      <!-- Next Post -->
      <div class="flex-1 sm:text-right">
        {#if nextPost}
          <div class="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-400 mb-2">Bài sau →</div>
          <a 
            href={`/blog/${nextPost.slug}`}
            class="text-lg font-bold text-sky-800 dark:text-sky-400 hover:underline line-clamp-2 leading-snug"
          >
            {nextPost.title}
          </a>
        {/if}
      </div>

    </div>
  </nav>
{/if}

