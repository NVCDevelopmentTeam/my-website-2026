<script>
  import { truncate } from '$lib/utils/truncate'

  /**
   * PostPreview - Shows preview excerpt for post listings
   * - post.metadata.preview → Display excerpt (200-265 chars)
   */
  
  let { post } = $props()
  
  // Computations
  const preview = $derived(post?.metadata?.preview || post?.metadata?.description || 'Bài viết chưa có đoạn trích.')
  const hasValidPreview = $derived(
    preview !== 'Bài viết chưa có đoạn trích.' && 
    preview.trim().length > 0
  )
  const postUrl = $derived(`/blog/${post?.slug}`)
  
  // Truncate if too long (max 160 chars for approx 2 lines)
  // Logic: truncate in JS for SEO/SSR content, but use CSS line-clamp for visual safety
  const displayPreview = $derived(truncate(preview, 160))
</script>

<div class="mb-4">
  {#if hasValidPreview}
    <div class="text-gray-950 dark:text-gray-50 leading-relaxed line-clamp-2">
      {displayPreview}
      <a
        href={postUrl}
        
        class="ml-2 text-blue-800 dark:text-blue-300 font-bold hover:underline inline-block"
      >
        Đọc thêm →
      </a>
    </div>
  {:else}
    <p class="text-gray-800 dark:text-gray-300 italic leading-relaxed">
      Bài viết chưa có đoạn trích.
      <a
        href={postUrl}
        
        class="ml-2 text-blue-800 dark:text-blue-300 font-bold hover:underline"
      >
        Xem bài →
      </a>
    </p>
  {/if}
</div>
