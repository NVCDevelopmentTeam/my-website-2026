<script>
  import { siteConfig } from '$lib/config';

  // Props from parent component - support multiple formats
  let { 
    data = undefined,
    currentPage: propCurrentPage = undefined,
    totalPosts: propTotalPosts = undefined,
    baseUrl: propBaseUrl = '/blog'
  } = $props();

  // Extract page info from server data (support both metadata.page and direct props)
  let currentPage = $derived(
    propCurrentPage || 
    data?.metadata?.page || 
    data?.currentPage || 
    1
  );
  
  let totalPosts = $derived(
    propTotalPosts || 
    data?.totalPosts || 
    data?.metadata?.total || 
    0
  );
  
  let baseUrl = $derived(propBaseUrl || data?.baseUrl || '/blog');

  // Get config from siteConfig
  const perPage = siteConfig.pagination.postsPerPage;
  const maxVisible = 5; // Maximum number of visible page buttons

  // Calculations
  let totalPages = $derived(Math.ceil(totalPosts / perPage));
  let hasNext = $derived(currentPage < totalPages);
  let hasPrev = $derived(currentPage > 1);

  // Auto scroll to top when page changes (Svelte 5 runes mode)
  $effect(() => {
    // Trigger on currentPage change
    currentPage;
    // Scroll to top instantly (like page reload)
    window.scrollTo({ top: 0, behavior: 'instant' });
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

  // Build URL (Vue.js style with query params)
  function buildUrl(pageNum) {
    // Page 1: /blog (no query)
    // Page 2+: /blog?page=2, /blog?page=3, ...
    if (pageNum === 1) {
      return baseUrl;
    }
    return `${baseUrl}?page=${pageNum}`;
  }
</script>

{#if totalPages > 1}
  <nav class="flex justify-center items-center mt-8 mb-4" aria-label="Phân trang">
    
    <ul class="inline-flex items-center gap-1">
      
      <!-- Previous Button -->
      {#if hasPrev}
        <li>
          <a
            href={buildUrl(currentPage - 1)}
            data-sveltekit-reload
            class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Trang trước"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Trước</span>
          </a>
        </li>
      {/if}

      <!-- Page Numbers -->
      {#each pageNumbers() as num (typeof num === 'number' ? `page-${num}` : `ellipsis-${Math.random()}`)}
        <li>
          {#if num === '...'}
            <span class="inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 dark:text-gray-400">
              …
            </span>
          {:else if num === currentPage}
            <span
              class="inline-flex items-center justify-center w-10 h-10 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 border border-blue-600 dark:border-blue-500 rounded cursor-default"
              aria-current="page"
              aria-label="Trang {num}"
            >
              {num}
            </span>
          {:else}
            <a
              href={buildUrl(num)}
              data-sveltekit-reload
              class="inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
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
            data-sveltekit-reload
            class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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