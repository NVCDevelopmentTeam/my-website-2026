<script>
  import { browser } from '$app/environment';

  // Props definition using Svelte 5 Runes
  let { post, children } = $props();

  // Extract TOC - handle both post.toc and post.metadata.toc safely
  let toc = $derived(
    Array.isArray(post?.toc) 
      ? post.toc 
      : Array.isArray(post?.metadata?.toc) 
      ? post.metadata.toc 
      : []
  );

  // State management - default collapsed for cleaner UI
  let activeHeading = $state(null);
  let isExpanded = $state(false);

  // Set active heading based on scroll position
  function setActiveHeading() {
    if (!browser || toc.length === 0) return;

    const scrollY = window.scrollY;
    let currentBest = null;

    for (const h of toc) {
      const el = document.getElementById(h.id);
      if (el) {
        // 150px offset to detect heading before it hits the very top
        const offsetTop = el.getBoundingClientRect().top + window.scrollY;
        if (scrollY >= offsetTop - 150) {
          currentBest = h.id;
        }
      }
    }

    // Update active heading state
    activeHeading = toc.find(h => h.id === currentBest) || toc[0];
  }

  // Smooth scroll to heading with error handling and fallback strategies
  function scrollTo(e, id) {
    if (!browser) return;
    
    setTimeout(() => {
      const el = document.getElementById(id);
      
      if (el) {
        // Use scrollIntoView for reliable scrolling
        el.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
        
        // Add small offset for fixed headers
        setTimeout(() => {
          window.scrollBy({ top: -80, behavior: 'smooth' });
        }, 50);
        
        // 🎯 Auto-collapse TOC after scrolling for cleaner UI
        isExpanded = false;
      }
    }, 10);
  }

  // Calculate indentation based on heading level
  function getIndent(level) {
    if (toc.length === 0) return 0;
    // Normalize levels: e.g., if document starts with H2, H2 has 0 indent
    const minLevel = Math.min(...toc.map(h => h.level));
    return (level - minLevel) * 16;
  }

  // Effect to initialize active heading and set up scroll listener
  $effect(() => {
    if (browser && toc.length > 0) {
      // Initialize active heading on mount
      setActiveHeading();
      
      // Set up scroll listener
      const handleScroll = () => setActiveHeading();
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // Cleanup on unmount
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  });
</script>

{#if toc.length > 0}
  <nav 
    class="my-8 p-6 bg-blue-50/50 dark:bg-gray-900 border-l-4 border-blue-800 dark:border-blue-400 rounded-r-2xl shadow-sm transition-all duration-300"
    aria-labelledby="toc-heading"
  >
    
    <div class="flex items-center justify-between mb-4">
      <p 
        id="toc-heading" 
        class="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2"
      >
        <svg 
          class="w-5 h-5 text-blue-800 dark:text-blue-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Mục lục bài viết
      </p>

      <button 
        onclick={() => isExpanded = !isExpanded}
        class="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors"
        aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
        aria-expanded={isExpanded}
      >
        <svg 
          class="w-5 h-5 text-gray-800 dark:text-gray-400 transition-transform duration-300 {isExpanded ? 'rotate-180' : ''}"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>

    {#if isExpanded}
      {#if children}
        {@render children()}
      {:else}
        <ul class="list-none p-0 m-0 flex flex-col gap-2" role="list">
          {#each toc as h (h.id)}
            {@const indent = getIndent(h.level)}
            {@const isActive = activeHeading?.id === h.id}
            
            <li style="margin-left: {indent}px;" class="transition-all duration-200">
              <a 
                href="#{h.id}" 
                onclick={(e) => scrollTo(e, h.id)}
                class="flex items-start gap-2 text-sm px-3 py-2 rounded-xl transition-all duration-200 no-underline
                  {isActive 
                    ? 'text-blue-800 dark:text-blue-400 bg-white dark:bg-gray-800 font-bold' 
                    : 'text-gray-800 dark:text-gray-300 hover:text-blue-800 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800'}"
                aria-label={h.title}
                aria-current={isActive ? 'location' : undefined}
              >
                <span 
                  class="mt-0.5 flex-shrink-0 transition-opacity duration-200 {isActive ? 'text-blue-800 dark:text-blue-400 opacity-100' : 'text-blue-800 dark:text-blue-400 opacity-60'}"
                  aria-hidden="true"
                >
                  {h.level <= 2 ? '•' : '◦'}
                </span>
                <span class="flex-1 transition-transform duration-200 hover:translate-x-1">
                  {h.title}
                </span>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </nav>
{/if}

