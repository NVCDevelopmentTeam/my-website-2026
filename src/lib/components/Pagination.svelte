<script>
  import { page } from '$app/state';
  import { siteConfig } from '$lib/config';
  import { browser } from '$app/environment';

  // Props from parent component - flexible naming
  let { 
    metadata = undefined,
    pagination = undefined,
    data = undefined,
    currentPage: propCurrentPage = undefined,
    totalPosts: propTotalPosts = undefined,
    baseUrl: propBaseUrl = undefined
  } = $props();

  // Auto-extract metadata from multiple sources
  const meta = $derived.by(() => {
    // Priority: pagination prop > metadata prop > data.pagination > data.metadata > individual props
    const metaSource = pagination || metadata || data?.pagination || data?.metadata || {};
    
    // Auto-detect baseUrl
    let detectedBaseUrl = propBaseUrl || 
                         metaSource.baseUrl || 
                         data?.baseUrl || 
                         page.data?.baseUrl;
    
    if (!detectedBaseUrl) {
      detectedBaseUrl = page.url.pathname.split('/page/')[0].replace(/\/$/, '') || '/';
    }
    
    // Extract values with better fallback
    const extractedPage = propCurrentPage || 
                         metaSource.currentPage ||
                         metaSource.page ||
                         data?.currentPage || 
                         page.data?.currentPage ||
                         1;
    
    const extractedTotal = propTotalPosts || 
                          metaSource.totalPosts ||
                          metaSource.total ||
                          data?.totalPosts || 
                          0;
    
    return {
      currentPage: Number(extractedPage),
      totalPosts: Number(extractedTotal),
      baseUrl: detectedBaseUrl
    };
  });

  // Extract page info from metadata
  const { currentPage, totalPosts, baseUrl } = $derived(meta);

  // Get config from siteConfig
  const perPage = siteConfig.pagination.postsPerPage;
  const maxVisible = 5; // Maximum number of visible page buttons

  // Calculations
  const totalPages = $derived(Math.ceil(totalPosts / perPage));
  const hasNext = $derived(currentPage < totalPages);
  const hasPrev = $derived(currentPage > 1);

  // Generate page numbers array (WordPress style)
  const pageNumbers = $derived.by(() => {
    const pages = [];
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, currentPage + half);

      if (currentPage <= half) {
        end = maxVisible;
      } else if (currentPage >= totalPages - half) {
        start = totalPages - maxVisible + 1;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (start > 1) {
        pages.unshift('...');
        pages.unshift(1);
      }
      if (end < totalPages) {
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  });

  // Build URL - Now using query parameters as requested
  function buildUrl(pageNum) {
    if (pageNum === 1) {
      return baseUrl;
    }
    
    // Always use query parameters for pagination as per requirements
    // Format: baseUrl?page=X
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${pageNum}`;
  }
</script>

{#if totalPages > 1}
  <nav class="flex justify-center items-center mt-8 mb-4">
    
    <ul class="inline-flex items-center gap-1">
      
      <!-- Previous Button -->
      {#if hasPrev}
        <li>
          <a
            href={buildUrl(currentPage - 1)}
            data-sveltekit-preload-data="hover"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-950 dark:text-gray-50 bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Trước</span>
          </a>
        </li>
      {/if}

      <!-- Page Numbers -->
      {#each pageNumbers as num, i (typeof num === 'number' ? `page-${num}` : `ellipsis-${i}`)}
        <li class="{typeof num === 'number' && Math.abs(num - currentPage) > 1 && num !== 1 && num !== totalPages ? 'hidden md:block' : ''}">
          {#if num === '...'}
            <span class="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-gray-950 dark:text-gray-400">
              …
            </span>
          {:else if num === currentPage}
            <span
              class="inline-flex items-center justify-center w-10 h-10 text-sm font-black text-white bg-sky-950 dark:bg-sky-400 dark:text-gray-950 border border-sky-950 dark:border-sky-400 rounded cursor-default"
              aria-current="page"
              aria-label="Trang {num}"
            >
              {num}
            </span>
          {:else}
            <a
              href={buildUrl(num)}
              data-sveltekit-preload-data="hover"
              class="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-gray-950 dark:text-gray-50 bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-500 dark:hover:border-gray-400 transition-colors"
              aria-label="Trang {num}"
            >
              {num}
            </a>
          {/if}
        </li>
      {/each}

      <!-- Next Button -->
      {#if hasNext}
        <li>
          <a
            href={buildUrl(currentPage + 1)}
            data-sveltekit-preload-data="hover"
            class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-950 dark:text-gray-50 bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Trang sau"
          >
            <span>Sau</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </li>
      {/if}

    </ul>

  </nav>
{/if}
