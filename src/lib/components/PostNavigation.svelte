<script>
  import { siteConfig } from '$lib/config'

  let {
    post = undefined,
    prevPost: propPrevPost = undefined,
    nextPost: propNextPost = undefined
  } = $props()

  // -----------------------------------------------------
  // Config
  // -----------------------------------------------------

  const blogBasePath = siteConfig?.blog?.basePath || '/blog'
  const prefetchEnabled = siteConfig?.prefetch?.enabled ?? true

  const labels = {
    navigation: 'Điều hướng bài viết',
    previous: 'Bài trước',
    next: 'Bài sau',
    srOnly: 'Điều hướng bài viết'
  }

  // -----------------------------------------------------
  // Derived navigation posts
  // -----------------------------------------------------

  const prevPost = $derived(propPrevPost ?? post?.prevPost ?? post?.metadata?.prevPost ?? null)

  const nextPost = $derived(propNextPost ?? post?.nextPost ?? post?.metadata?.nextPost ?? null)

  const hasPrevPost = $derived(Boolean(prevPost))
  const hasNextPost = $derived(Boolean(nextPost))
  const hasNavigation = $derived(hasPrevPost || hasNextPost)

  // -----------------------------------------------------
  // Helpers
  // -----------------------------------------------------

  function getPostUrl(slug) {
    if (!slug) return '#'

    const basePath = blogBasePath.replace(/\/$/, '')
    const normalizedSlug = String(slug).replace(/^\/+/, '')

    return `${basePath}/${normalizedSlug}`
  }

  function getPostTitle(post) {
    return post?.metadata?.title || post?.title || 'Không có tiêu đề'
  }
</script>

{#if hasNavigation}
  <nav
    aria-label={labels.navigation}
    class="mt-12 border-t border-gray-200 pt-8 duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-3 dark:border-gray-800"
  >
    <h2 class="sr-only">
      {labels.srOnly}
    </h2>

    <div class="flex flex-col items-stretch justify-between gap-6 sm:flex-row">
      <!-- Previous -->
      <div class="min-w-0 flex-1">
        {#if hasPrevPost}
          <div
            class="mb-2 text-xs text-gray-900 font-black tracking-widest uppercase dark:text-gray-100"
          >
            ← {labels.previous}
          </div>

          <a
            href={getPostUrl(prevPost.slug)}
            rel="prev"
            aria-label={`${labels.previous}: ${getPostTitle(prevPost)}`}
            data-sveltekit-preload-data={prefetchEnabled ? 'hover' : undefined}
            class="line-clamp-2 block text-lg text-sky-800 font-black leading-snug decoration-2 underline-offset-2 transition-all duration-200 dark:text-sky-400 hover:text-sky-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 dark:hover:text-sky-300 dark:focus-visible:ring-offset-gray-950"
          >
            {getPostTitle(prevPost)}
          </a>
        {:else}
          <!-- Preserve layout symmetry -->
          <div class="pointer-events-none invisible select-none" aria-hidden="true">
            <div class="mb-2 text-xs font-black tracking-widest uppercase">
              ← {labels.previous}
            </div>

            <div class="text-lg font-black leading-snug">Placeholder</div>
          </div>
        {/if}
      </div>

      <!-- Next -->
      <div class="min-w-0 flex-1 sm:text-right">
        {#if hasNextPost}
          <div
            class="mb-2 text-xs text-gray-900 font-black tracking-widest uppercase dark:text-gray-100"
          >
            {labels.next} →
          </div>

          <a
            href={getPostUrl(nextPost.slug)}
            rel="next"
            aria-label={`${labels.next}: ${getPostTitle(nextPost)}`}
            data-sveltekit-preload-data={prefetchEnabled ? 'hover' : undefined}
            class="line-clamp-2 block text-lg text-sky-800 font-black leading-snug decoration-2 underline-offset-2 transition-all duration-200 dark:text-sky-400 hover:text-sky-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 dark:hover:text-sky-300 dark:focus-visible:ring-offset-gray-950"
          >
            {getPostTitle(nextPost)}
          </a>
        {:else}
          <!-- Preserve layout symmetry -->
          <div class="pointer-events-none invisible select-none" aria-hidden="true">
            <div class="mb-2 text-xs font-black tracking-widest uppercase">
              {labels.next} →
            </div>

            <div class="text-lg font-black leading-snug">Placeholder</div>
          </div>
        {/if}
      </div>
    </div>
  </nav>
{/if}
