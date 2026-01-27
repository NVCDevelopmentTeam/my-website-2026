<script>
  import { page } from '$app/state';
  import { siteConfig } from '$lib/config';

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
  const extractedMetadata = $derived(() => {
    const currentPath = page.url.pathname;
    
    // Priority: pagination prop > metadata prop > data.pagination > data.metadata > individual props
    const metaSource = pagination || metadata || data?.pagination || data?.metadata || {};
    
    let pageFromUrl = 1;
    try {
      // Only access searchParams if not in a context where it's forbidden
      // SvelteKit throws when accessing search on a prerendered page
      const urlParams = new URLSearchParams(page.url.search);
      pageFromUrl = parseInt(urlParams.get('page') || '1', 10);
    } catch {
      // Fallback if search is inaccessible (e.g. during prerendering)
      pageFromUrl = 1;
    }
    
    // Auto-detect baseUrl from current path if not provided
    let detectedBaseUrl = propBaseUrl || 
                         metaSource.baseUrl || 
                         data?.baseUrl || 
                         page.data?.baseUrl;
    
    if (!detectedBaseUrl) {
      // Smart detection from URL
      if (currentPath.includes('/blog/category/')) {
        const slug = currentPath.split('/blog/category/')[1]?.split('?')[0]?.replace(/\/$/, '');
        detectedBaseUrl = `/blog/category/${slug}`;
      } else if (currentPath.includes('/blog/tag/')) {
        const slug = currentPath.split('/blog/tag/')[1]?.split('?')[0]?.replace(/\/$/, '');
        detectedBaseUrl = `/blog/tag/${slug}`;
      } else if (currentPath.startsWith('/blog')) {
        detectedBaseUrl = '/blog';
      } else {
        detectedBaseUrl = currentPath.split('?')[0].replace(/\/$/, '');
      }
    }
    
    // Support both old format (currentPage, totalPosts) and new format (page, total)
    const extractedPage = propCurrentPage || 
                         metaSource.currentPage ||
                         metaSource.page ||
                         data?.currentPage || 
                         page.data?.metadata?.page ||
                         page.data?.currentPage ||
                         pageFromUrl ||
                         1;
    
    const extractedTotal = propTotalPosts || 
                          metaSource.totalPosts ||
                          metaSource.total ||
                          data?.totalPosts || 
                          page.data?.metadata?.total ||
                          page.data?.totalPosts ||
                          0;
    
    return {
      currentPage: extractedPage,
      totalPosts: extractedTotal,
      baseUrl: detectedBaseUrl
    };
  });

  // Extract page info from metadata
  let currentPage = $derived(extractedMetadata().currentPage);
  let totalPosts = $derived(extractedMetadata().totalPosts);
  let baseUrl = $derived(extractedMetadata().baseUrl);

  // Get config from siteConfig
  const perPage = siteConfig.pagination.postsPerPage;
  const maxVisible = 5; // Maximum number of visible page buttons

  // Calculations
  const totalPages = $derived(Math.ceil(totalPosts / perPage));
  const hasNext = $derived(currentPage < totalPages);
  const hasPrev = $derived(currentPage > 1);

  // Auto scroll to top when page changes (Svelte 5 runes mode)
  $effect(() => {
    // Trigger on currentPage change
    currentPage;
    // Scroll to top instantly (like page reload)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  });

  // Generate page numbers array (WordPress style)
  let pageNumbers = $derived(() => {
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

  // Build URL
  function buildUrl(pageNum) {
    if (pageNum === 1) {
      return baseUrl;
    }
    return `${baseUrl}?page=${pageNum}`;
  }
</script>

{#if totalPages > 1}
  <nav class="flex justify-center items-center mt-12 mb-8" aria-label="Phân trang">
    
    <ul class="inline-flex items-center gap-2">
      
      <!-- Previous Button -->
      {#if hasPrev}
        <li>
          <a
            href={buildUrl(currentPage - 1)}
            class="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-800 dark:focus:ring-sky-400"
            aria-label="Trang trước"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Trước</span>
          </a>
        </li>
      {/if}

      <!-- Page Numbers -->
      {#each pageNumbers() as num (typeof num === 'number' ? `page-${num}` : `ellipsis-${Math.random()}`)}
        <li>
          {#if num === '...'}
            <span class="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-gray-800 dark:text-gray-400">
              …
            </span>
          {:else if num === currentPage}
            <span
              class="inline-flex items-center justify-center w-10 h-10 text-sm font-black text-white bg-sky-800 dark:bg-sky-400 dark:text-gray-950 border border-sky-800 dark:border-sky-400 rounded-xl cursor-default shadow-md shadow-sky-500/20"
              aria-current="page"
              aria-label="Trang {num}"
            >
              {num}
            </span>
          {:else}
            <a
              href={buildUrl(num)}
              class="inline-flex items-center justify-center w-10 h-10 text-sm font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-sky-800 dark:hover:border-sky-400 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-800 dark:focus:ring-sky-400"
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
            class="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-800 dark:focus:ring-sky-400"
            aria-label="Trang sau"
          >
            <span>Sau</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </li>
      {/if}

    </ul>

  </nav>
{/if}

