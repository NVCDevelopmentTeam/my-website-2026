<script>
  import { truncate } from '$lib/utils/truncate'

  /**
   * PostPreview - Shows preview excerpt for post listings
   * - post.metadata.preview → Display excerpt (200-265 chars)
   */

  let { post } = $props()

  // Computations
  const preview = $derived(
    post?.metadata?.preview || post?.metadata?.description || 'Bài viết chưa có đoạn trích.'
  )
  const hasValidPreview = $derived(
    preview !== 'Bài viết chưa có đoạn trích.' && preview.trim().length > 0
  )
  const postUrl = $derived(`/blog/${post?.slug}`)

  // Truncate if too long (max 160 chars for approx 2 lines)
  // Logic: truncate in JS for SEO/SSR content, but use CSS line-clamp for visual safety
  const displayPreview = $derived(truncate(preview, 160))
</script>

<div class="mb-4">
  {#if hasValidPreview}
    <div class="line-clamp-2 leading-relaxed text-gray-950 dark:text-gray-50">
      {displayPreview}
      <a
        href={postUrl}
        class="ml-2 inline-block font-bold text-blue-800 hover:underline dark:text-blue-300"
      >
        →tiếp tục đọc {post.metadata.title}
      </a>
    </div>
  {:else}
    <p class="leading-relaxed text-gray-800 italic dark:text-gray-300">
      Bài viết chưa có đoạn trích.
      <a href={postUrl} class="ml-2 font-bold text-blue-800 hover:underline dark:text-blue-300">
        tiếp tục đọc {post.metadata.title} →
      </a>
    </p>
  {/if}
</div>
