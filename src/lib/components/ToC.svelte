<script>
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'
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
    rawToc.map((item) => ({
      ...item,
      id: item.id || slugify(item.title),
      level: item.level || 2
    }))
  )

  // Computed properties - similar to computed in Vue
  const hasToc = $derived(processedToc.length > 0)
  const minLevel = $derived(hasToc ? Math.min(...processedToc.map((h) => h.level)) : 0)

  /* -----------------------------------------------------
     Methods - similar to methods in Vue
  ----------------------------------------------------- */

  // Scroll to a specific heading ID smoothly and set focus
  function scrollToId(id, smooth = true) {
    if (!browser || !id) return false
    const decodedId = decodeURIComponent(id).replace(/^#/, '')
    const el = document.getElementById(decodedId)
    if (el) {
      el.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start'
      })
      el.setAttribute('tabindex', '-1')
      el.focus({ preventScroll: true })
      return true
    }
    return false
  }

  // Handle link click
  function handleLinkClick(e) {
    const href = e.currentTarget.getAttribute('href')
    if (href?.startsWith('#')) {
      const id = href.slice(1)
      e.preventDefault()
      pushState(`#${id}`, {})
      scrollToId(id)
      const found = processedToc.find((h) => h.id === id)
      if (found) activeHeading = found
    }

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      isExpanded = false
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

  // Visual indent marker style per heading level — returns CSS classes for a
  // decorative dot (no text glyph), so there is no character in the DOM at
  // all for assistive tech to potentially pick up.
  function getBulletClass(level) {
    if (level <= 2) return 'h-1.5 w-1.5 rounded-full bg-current'
    if (level === 3) return 'h-1.5 w-1.5 rounded-full border border-current bg-transparent'
    return 'h-1 w-1 rounded-full border border-current bg-transparent'
  }

  // Navigation hash watcher
  afterNavigate((nav) => {
    if (nav.to?.url.hash) {
      const hash = nav.to.url.hash.slice(1)
      setTimeout(() => scrollToId(hash), 200)
    }
  })

  $effect(() => {
    if (browser && post && hasToc) {
      const timer = setTimeout(() => {
        const headingElements = processedToc
          .map((h) => document.getElementById(h.id))
          .filter(Boolean)

        if (headingElements.length > 0) {
          observer = new IntersectionObserver(
            (entries) => {
              const visible = entries.find((e) => e.isIntersecting)
              if (visible) {
                const found = processedToc.find((h) => h.id === visible.target.id)
                if (found) activeHeading = found
              }
            },
            {
              rootMargin: '-80px 0px -70% 0px',
              threshold: 0.1
            }
          )
          headingElements.forEach((el) => observer?.observe(el))
        }

        const handleScroll = () => {
          isSticky = window.scrollY > 300
        }
        window.addEventListener('scroll', handleScroll, { passive: true })

        if (window.location.hash) {
          scrollToId(window.location.hash.slice(1))
        }
      }, 100)

      return () => {
        clearTimeout(timer)
        if (observer) observer.disconnect()
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
    class="animate-in slide-in-from-left-5 fade-in my-8 border-l-4 border-blue-800 rounded-r-2xl bg-blue-50/50 p-4 shadow-sm transition-all duration-300 dark:border-blue-400 dark:bg-gray-900 sm:p-6 hover:shadow-md {isSticky
      ? 'lg:sticky lg:top-20'
      : ''}"
  >
    <!-- Header with toggle -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="m-0 flex items-center gap-2 text-lg text-gray-950 font-bold dark:text-white">
        <svg
          class="h-5 w-5 text-blue-800 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {labels.title}
      </h2>

      <button
        onclick={toggleExpand}
        class="rounded-xl p-2 transition-colors duration-200 hover:bg-white dark:hover:bg-gray-800"
        aria-label={isExpanded ? labels.collapse : labels.expand}
        aria-expanded={isExpanded}
        aria-controls="toc-list"
      >
        <svg
          class="h-5 w-5 text-gray-950 transition-transform duration-300 dark:text-gray-50 {isExpanded
            ? 'rotate-180'
            : ''}"
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
      <div id="toc-list" class="animate-in fade-in slide-in-from-top-2 duration-200">
        {#if children}
          {@render children()}
        {:else}
          <ul
            class="m-0 max-h-[70vh] flex flex-col list-none gap-2 overflow-y-auto p-0"
            role="list"
          >
            {#each processedToc as h (h.id)}
              {@const indent = getIndent(h.level)}
              {@const isActive = activeHeading?.id === h.id}
              {@const bulletClass = getBulletClass(h.level)}

              <li style="margin-left: {indent}px;" class="transition-all duration-200">
                <a
                  href="#{h.id}"
                  onclick={handleLinkClick}
                  class="group relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm no-underline transition-all duration-200 {isActive
                    ? 'bg-white text-blue-900 font-bold shadow-sm before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:rounded-full before:bg-current dark:bg-gray-800 dark:text-blue-300 before:-translate-y-1/2'
                    : 'text-gray-950 hover:bg-white dark:text-gray-50 hover:text-blue-800 dark:hover:bg-gray-800 dark:hover:text-blue-400'}"
                  aria-current={isActive ? 'location' : undefined}
                >
                  <span
                    class="flex-shrink-0 transition-all duration-200 {bulletClass}
                      {isActive
                      ? 'scale-110 text-blue-900 opacity-100 dark:text-blue-300'
                      : 'text-blue-800 opacity-70 group-hover:scale-105 dark:text-blue-400 group-hover:opacity-100'}"
                  ></span>
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
