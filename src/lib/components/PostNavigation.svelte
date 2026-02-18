<script>
  import { siteConfig } from '$lib/config'
  import { onMount } from 'svelte'
  
  // Props - Vue.js/Nuxt.js style with reactive state
  let { 
    post = undefined,
    prevPost: propPrevPost = undefined, 
    nextPost: propNextPost = undefined 
  } = $props()

  // Reactive state - similar to data() in Vue
  let prevPost = $state(null)
  let nextPost = $state(null)
  let isLoading = $state(true)
  
  // Site metadata from config
  const blogBasePath = siteConfig?.blog?.basePath || '/blog'
  const prefetchEnabled = siteConfig?.prefetch?.enabled ?? true
  const labels = {
    navigation: 'Điều hướng bài viết',
    previous: 'Bài trước',
    next: 'Bài sau',
    srOnly: 'Điều hướng bài viết'
  }

  // Reactive effect - similar to watch in Vue
  $effect(() => {
    // Auto-extract from post object or use direct props
    prevPost = propPrevPost || 
                post?.prevPost || 
                post?.metadata?.prevPost || 
                null
    
    nextPost = propNextPost || 
                post?.nextPost || 
                post?.metadata?.nextPost || 
                null
    
    isLoading = false
  })

  // Computed - similar to computed in Vue
  const hasPrevPost = $derived(prevPost !== null && prevPost !== undefined)
  const hasNextPost = $derived(nextPost !== null && nextPost !== undefined)
  const hasNavigation = $derived(hasPrevPost || hasNextPost)
  
  // Helper function - similar to methods in Vue
  function getPostUrl(slug) {
    if (!slug) return '#'
    return `${blogBasePath}/${slug}`
  }
  
  function getPostTitle(post) {
    return post?.metadata?.title || post?.title || 'Không có tiêu đề'
  }

  // Lifecycle - similar to mounted in Vue
  onMount(() => {
    // Prefetch navigation posts if enabled
    if (prefetchEnabled && typeof window !== 'undefined') {
      if (hasPrevPost) {
        const prevLink = document.querySelector(`a[href="${getPostUrl(prevPost.slug)}"]`)
        if (prevLink) prevLink.setAttribute('data-sveltekit-preload-data', 'hover')
      }
      
      if (hasNextPost) {
        const nextLink = document.querySelector(`a[href="${getPostUrl(nextPost.slug)}"]`)
        if (nextLink) nextLink.setAttribute('data-sveltekit-preload-data', 'hover')
      }
    }
  })
</script>

{#if hasNavigation && !isLoading}
  <!-- WordPress-style navigation with Nuxt.js transition -->
  <nav
    class="border-t border-gray-100 dark:border-gray-800 mt-12 pt-8 transition-opacity duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-3"
  >
    <h2 class="sr-only">{labels.srOnly}</h2>    
    <div class="flex flex-col sm:flex-row justify-between items-stretch gap-6">
      
      <!-- Previous Post -->
      <div class="flex-1">
        {#if hasPrevPost}
          <div class="text-xs font-black uppercase tracking-widest text-gray-950 dark:text-gray-50 mb-2">
            ← {labels.previous}
          </div>
          <a 
            href={getPostUrl(prevPost.slug)}
            data-sveltekit-preload-data="hover"
            
            class="block text-lg font-black text-sky-800 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 hover:underline decoration-2 underline-offset-2 line-clamp-2 leading-snug transition-all duration-200"
            rel="prev"
            aria-label={`${labels.previous}: ${getPostTitle(prevPost)}`}
          >
            {getPostTitle(prevPost)}
          </a>
        {:else}
          <div class="opacity-0 pointer-events-none select-none" aria-hidden="true">
            <div class="text-xs font-bold uppercase tracking-widest mb-2">← {labels.previous}</div>
            <div class="text-lg font-bold line-clamp-2 leading-snug">Placeholder</div>
          </div>
        {/if}
      </div>

      <!-- Next Post -->
      <div class="flex-1 sm:text-right">
        {#if hasNextPost}
          <div class="text-xs font-black uppercase tracking-widest text-gray-950 dark:text-gray-50 mb-2">
            {labels.next} →
          </div>
          <a 
            href={getPostUrl(nextPost.slug)}
            data-sveltekit-preload-data="hover"
            
            class="block text-lg font-black text-sky-800 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 hover:underline decoration-2 underline-offset-2 line-clamp-2 leading-snug transition-all duration-200"
            rel="next"
            aria-label={`${labels.next}: ${getPostTitle(nextPost)}`}
          >
            {getPostTitle(nextPost)}
          </a>
        {:else}
          <div class="opacity-0 pointer-events-none select-none" aria-hidden="true">
            <div class="text-xs font-bold uppercase tracking-widest mb-2">{labels.next} →</div>
            <div class="text-lg font-bold line-clamp-2 leading-snug">Placeholder</div>
          </div>
        {/if}
      </div>

    </div>
  </nav>
{/if}
