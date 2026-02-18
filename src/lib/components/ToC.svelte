<script>
  import { browser } from '$app/environment'
  import { onMount, tick } from 'svelte'
  import { afterNavigate, pushState } from '$app/navigation'
  import { slugify } from '$lib/utils/slugify'

  // Props - Vue.js/Nuxt.js style
  let { post, children = null } = $props()

  // Config labels
  const labels = {
    title: 'Mục lục bài viết',
    collapse: 'Thu gọn',
    expand: 'Mở rộng'
  }

  // Reactive state - similar to data() in Vue
  let activeHeading = $state(null)
  let isExpanded = $state(false)
  let isSticky = $state(false)
  let observer = null

  // Extract TOC from post - support multiple formats
  let rawToc = $derived(
    Array.isArray(post?.toc) 
      ? post.toc 
      : Array.isArray(post?.metadata?.toc) 
      ? post.metadata.toc 
      : []
  )

  // Process TOC with slugified IDs - similar to computed in Vue
  let processedToc = $derived(
    rawToc.map(item => ({
      ...item,
      id: item.id || slugify(item.title),
      level: item.level || 2
    }))
  )

  // Computed properties - similar to computed in Vue
  const hasToc = $derived(processedToc.length > 0)
  const minLevel = $derived(
    hasToc ? Math.min(...processedToc.map(h => h.level)) : 0
  )

  /* -----------------------------------------------------
     Methods - similar to methods in Vue
  ----------------------------------------------------- */

  // Fix heading IDs in DOM to match slugified versions
  function syncHeadingIds() {
    if (!browser) return
    
    // Select all headings within the main content area
    const contentArea = document.querySelector('article') || document.querySelector('main')
    if (!contentArea) return

    const headings = contentArea.querySelectorAll('h1, h2, h3, h4, h5, h6')
    
    processedToc.forEach(h => {
      let foundHeading = null
      
      // 1. Try to find by ID exactly
      foundHeading = document.getElementById(h.id)
      
      // 2. Try to find by text content if ID not found
      if (!foundHeading) {
        for (const el of headings) {
          // Check text content or nested anchor text (rehype-autolink-headings behavior)
          const text = el.textContent.trim().toLowerCase()
          if (text === h.title.toLowerCase()) {
            foundHeading = el
            break
          }
        }
      }
      
      // 3. Try to find by slugified text content
      if (!foundHeading) {
        for (const el of headings) {
          if (slugify(el.textContent.trim()) === h.id) {
            foundHeading = el
            break
          }
        }
      }
      
      // Update ID to match TOC expected ID if found
      if (foundHeading) {
         if (foundHeading.id !== h.id) {
            foundHeading.id = h.id
         }
         // Ensure it's focusable for accessibility
         if (!foundHeading.hasAttribute('tabindex')) {
            foundHeading.setAttribute('tabindex', '-1')
         }
      }
    })
  }

  // Scroll to a specific ID with multiple strategies
  async function scrollToId(id, smooth = true) {
    if (!browser || !id) return
    
    // Normalize ID
    const decodedId = decodeURIComponent(id).replace(/^#/, '')
    
    // Ensure headings are synced first
    syncHeadingIds()
    
    // Wait for Svelte to finish any pending updates
    await tick()
    
    let el = document.getElementById(decodedId)
    
    // If not found, try finding by matching data attributes or text content fallback
    if (!el) {
       // Try re-syncing in case DOM changed
       syncHeadingIds()
       el = document.getElementById(decodedId)
    }

    if (el) {
      // Use scrollIntoView which respects scroll-margin-top (defined in app.css)
      el.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start'
      })
      
      // Move focus to the element (important for accessibility/skip-to)
      el.focus({ preventScroll: true })
      
      return true
    }
    
    return false
  }

  // Handle link click
  async function handleLinkClick(e) {
    const href = e.currentTarget.getAttribute('href')
    if (href?.startsWith('#')) {
      const id = href.slice(1)
      e.preventDefault()
      
      // Update URL hash without jumping
      pushState(`#${id}`, {})
      
      // Manual trigger for immediate response
      const success = await scrollToId(id)
      
      if (success) {
        // Set focus to the element for accessibility/skip-link behavior
        const el = document.getElementById(id)
        if (el) {
          el.setAttribute('tabindex', '-1')
          el.focus({ preventScroll: true })
        }
      }
      
      // Set active immediately
      const found = processedToc.find(h => h.id === id)
      if (found) activeHeading = found
    }

    // Auto-collapse after scroll on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        isExpanded = false
      }, 400)
    }
  }

  // Toggle expand/collapse
  function toggleExpand() {
    isExpanded = !isExpanded
  }

  // Calculate indentation
  function getIndent(level) {
    if (!hasToc) return 0
    return (level - minLevel) * 16
  }

  // Get bullet style
  function getBullet(level) {
    if (level <= 2) return '•'
    if (level === 3) return '◦'
    return '▪'
  }

  /* -----------------------------------------------------
     Lifecycle & Navigation
  ----------------------------------------------------- */

  // Watch for hash changes
  function onHashChange() {
    const hash = window.location.hash.slice(1)
    if (hash) scrollToId(hash)
  }

  // Handle navigation (including deep links)
  afterNavigate(async (nav) => {
    if (nav.to?.url.hash) {
      const hash = nav.to.url.hash.slice(1)
      // Wait a bit for the content to fully render
      setTimeout(() => scrollToId(hash), 300)
    }
  })

  $effect(() => {
    if (browser && post && hasToc) {
      // 1. Setup IntersectionObserver for active heading detection
      const headingElements = processedToc.map(h => document.getElementById(h.id)).filter(Boolean)
      
      if (headingElements.length > 0) {
        observer = new IntersectionObserver((entries) => {
          // Find the heading that is most "active" (visible at top)
          const visibleEntries = entries.filter(e => e.isIntersecting)
          if (visibleEntries.length > 0) {
            // Pick the first visible one (topmost)
            const id = visibleEntries[0].target.id
            const found = processedToc.find(h => h.id === id)
            if (found) activeHeading = found
          }
        }, {
          rootMargin: '-80px 0% -80% 0%',
          threshold: 0.1
        })

        headingElements.forEach(el => observer.observe(el))
      }

      // 2. Setup scroll listener for sticky state only (less frequent update needed)
      const handleScroll = () => {
        isSticky = window.scrollY > 300
      }
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('hashchange', onHashChange)

      // 3. Initial hash check
      const currentHash = window.location.hash.slice(1)
      if (currentHash) {
        setTimeout(() => scrollToId(currentHash), 500)
      }

      return () => {
        if (observer) observer.disconnect()
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('hashchange', onHashChange)
      }
    }
  })

  onMount(() => {
    if (browser && hasToc) {
      if (window.innerWidth >= 1024) {
        isExpanded = true
      }
    }
  })
</script>

{#if hasToc}
  <nav 
    class="my-8 p-4 sm:p-6 bg-blue-50/50 dark:bg-gray-900 border-l-4 border-blue-800 dark:border-blue-400 rounded-r-2xl shadow-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-left-5 fade-in
      {isSticky ? 'lg:sticky lg:top-20' : ''}"
  >
    
    <!-- Header with toggle -->
    <div class="flex items-center justify-between mb-4">
      <h2 
        id="toc-heading" 
        class="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2 m-0"
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
        {labels.title}
      </h2>

      <button 
        onclick={toggleExpand}
        class="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
        aria-label={isExpanded ? labels.collapse : labels.expand}
        aria-expanded={isExpanded}
        aria-controls="toc-list"
      >
        <svg 
          class="w-5 h-5 text-gray-950 dark:text-gray-50 transition-transform duration-300 {isExpanded ? 'rotate-180' : ''}"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>

    <!-- TOC List with smooth transition -->
    {#if isExpanded}
      <div 
        id="toc-list"
        class="animate-in fade-in slide-in-from-top-2 duration-200"
      >
        {#if children}
          {@render children()}
        {:else}
          <ul class="list-none p-0 m-0 flex flex-col gap-2 max-h-[70vh] overflow-y-auto" role="list">
            {#each processedToc as h (h.id)}
              {@const indent = getIndent(h.level)}
              {@const isActive = activeHeading?.id === h.id}
              {@const bullet = getBullet(h.level)}
              
              <li 
                style="margin-left: {indent}px;" 
                class="transition-all duration-200"
              >
                <a 
                  href="#{h.id}" 
                  onclick={handleLinkClick}
                  class="relative flex items-start gap-2 text-sm px-3 py-2 rounded-xl transition-all duration-200 no-underline group
                    {isActive 
                      ? 'text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 font-bold shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-5 before:bg-current before:rounded-full' 
                      : 'text-gray-950 dark:text-gray-50 hover:text-blue-800 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800'}"
                  aria-current={isActive ? 'location' : undefined}
                >
                  <span 
                    class="mt-0.5 flex-shrink-0 transition-all duration-200
                      {isActive 
                        ? 'text-blue-900 dark:text-blue-300 opacity-100 scale-110' 
                        : 'text-blue-800 dark:text-blue-400 opacity-70 group-hover:opacity-100 group-hover:scale-105'}"
                    aria-hidden="true"
                  >
                    {bullet}
                  </span>
                  <span class="flex-1 transition-transform duration-200 group-hover:translate-x-1">
                    {h.title}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </nav>
{/if}
