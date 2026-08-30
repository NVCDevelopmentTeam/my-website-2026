<script>
  import { page } from '$app/state'

  /**
   * @typedef {Object} Props
   * @property {any[]} [navPages] - list of Markdown pages { slug, metadata: { title } }
   */
  let { navPages = [] } = $props()

  let isMenuOpen = $state(false)
  let containerRef = $state(null)
  let openButtonRef = $state(null)

  function openMenu() {
    isMenuOpen = true
  }

  function closeMenu() {
    isMenuOpen = false
    if (openButtonRef) {
      requestAnimationFrame(() => openButtonRef?.focus())
    }
  }

  function handleMenuKeydown(event) {
    if (event.key === 'Escape' && isMenuOpen) {
      closeMenu()
    }
  }

  function handleMenuFocusout(event) {
    const container = event.currentTarget
    requestAnimationFrame(() => {
      if (container && !container.contains(document.activeElement)) {
        closeMenu()
      }
    })
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      closeMenu()
    }
  }

  function getHref(slug) {
    return slug === 'index' || slug === '' ? '/' : `/${slug}`
  }

  function isCurrentPage(slug) {
    const href = getHref(slug)
    return page.url.pathname === href
  }

  $effect(() => {
    if (isMenuOpen) {
      // Class toggle avoids reading computed style — prevents forced reflow.
      document.documentElement.classList.add('menu-open')
      requestAnimationFrame(() => {
        const firstLink = containerRef?.querySelector('a')
        if (firstLink) firstLink.focus()
      })
    } else {
      document.documentElement.classList.remove('menu-open')
    }

    return () => {
      document.documentElement.classList.remove('menu-open')
    }
  })
</script>

<!-- Mobile Menu -->
<nav class="flex items-center justify-end lg:hidden" aria-label="Main navigation (mobile)">
  <button
    bind:this={openButtonRef}
    onclick={openMenu}
    aria-haspopup="dialog"
    class="flex min-h-[48px] min-w-[48px] cursor-pointer items-center justify-center border-0 bg-transparent p-3 text-gray-900 transition-opacity hover:opacity-70 dark:text-gray-100"
  >
    <svg
      width="24"
      height="24"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="7.5" width="16" height="1.5" fill="currentColor" />
      <rect x="4" y="15" width="16" height="1.5" fill="currentColor" />
    </svg>
    <span class="sr-only">Mở menu điều hướng</span>
  </button>

  {#if isMenuOpen}
    <div
      bind:this={containerRef}
      class="fixed inset-0 z-[100000]"
      role="presentation"
      onfocusout={handleMenuFocusout}
      onkeydown={handleMenuKeydown}
    >
      <!-- Backdrop -->
      <div
        class="animate-in fade-in fixed inset-0 bg-black/60 duration-200"
        onclick={handleBackdropClick}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleBackdropClick(e)
          }
        }}
        role="button"
        tabindex="0"
        aria-label="Đóng menu"
      ></div>

      <!-- Menu Panel -->
      <div
        class="animate-in slide-in-from-right fixed top-0 right-0 bottom-0 w-full max-w-md overflow-y-auto bg-white text-gray-950 shadow-2xl duration-200 dark:bg-gray-950 dark:text-white"
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
        tabindex="-1"
      >
        <!-- Close Button -->
        <button
          onclick={closeMenu}
          class="absolute top-5 right-5 z-10 flex min-h-[48px] min-w-[48px] cursor-pointer items-center justify-center border-0 bg-transparent p-2 text-gray-950 transition-opacity hover:opacity-70 dark:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            aria-hidden="true"
            focusable="false"
            fill="currentColor"
          >
            <path
              d="m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z"
            />
          </svg>
          <span class="sr-only">Đóng</span>
        </button>

        <!-- Menu Content -->
        <div class="p-8 pt-20">
          <ul class="m-0 flex w-full list-none flex-col items-start justify-start space-y-1 p-0">
            {#each navPages as p (p.slug)}
              <li class="w-full">
                <a
                  class="block rounded-lg px-4 py-3 text-lg font-bold -tracking-[0.1px] text-gray-950 no-underline transition-colors hover:bg-gray-100 dark:text-gray-50 dark:hover:bg-gray-900"
                  class:font-black={isCurrentPage(p.slug)}
                  class:bg-gray-100={isCurrentPage(p.slug)}
                  class:dark:bg-gray-900={isCurrentPage(p.slug)}
                  href={getHref(p.slug)}
                  data-sveltekit-preload-data="hover"
                  aria-current={isCurrentPage(p.slug) ? 'page' : undefined}
                  onclick={closeMenu}
                >
                  {p.metadata.title}
                </a>
              </li>
            {/each}

            <li class="w-full">
              <a
                class="block rounded-lg px-4 py-3 text-lg font-bold -tracking-[0.1px] text-gray-950 no-underline transition-colors hover:bg-gray-100 dark:text-gray-50 dark:hover:bg-gray-900"
                class:font-black={page.url.pathname === '/blog'}
                class:bg-gray-100={page.url.pathname === '/blog'}
                class:dark:bg-gray-900={page.url.pathname === '/blog'}
                href="/blog"
                data-sveltekit-preload-data="hover"
                aria-current={page.url.pathname === '/blog' ? 'page' : undefined}
                onclick={closeMenu}
              >
                Blog
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  {/if}
</nav>

<!-- Desktop Menu -->
<nav
  class="relative hidden rounded-2xl border border-gray-200 bg-white/80 px-4 py-2 shadow-md backdrop-blur-md lg:block dark:border-gray-800 dark:bg-gray-950/80"
  aria-label="Main navigation"
>
  <ul class="m-0 flex list-none flex-wrap items-center justify-center gap-3 p-0">
    {#each navPages as p (p.slug)}
      <li>
        <a
          href={getHref(p.slug)}
          data-sveltekit-preload-data="hover"
          class="inline-block rounded-xl px-4 py-2 font-black text-gray-950 no-underline transition-[background-color,color] duration-300 hover:bg-sky-800 hover:text-white focus:ring-2 focus:ring-sky-800 focus:outline-none dark:text-gray-50 dark:hover:bg-sky-400 dark:hover:text-gray-950"
          class:bg-sky-800={isCurrentPage(p.slug)}
          class:dark:bg-sky-400={isCurrentPage(p.slug)}
          class:text-white={isCurrentPage(p.slug)}
          class:dark:text-gray-950={isCurrentPage(p.slug)}
          aria-current={isCurrentPage(p.slug) ? 'page' : undefined}
        >
          {p.metadata.title}
        </a>
      </li>
    {/each}

    <li>
      <a
        href="/blog"
        data-sveltekit-preload-data="hover"
        class="inline-block rounded-xl px-4 py-2 font-black text-gray-950 no-underline transition-[background-color,color] duration-300 hover:bg-sky-800 hover:text-white focus:ring-2 focus:ring-sky-800 focus:outline-none dark:text-gray-50 dark:hover:bg-sky-400 dark:hover:text-gray-950"
        class:bg-sky-800={page.url.pathname === '/blog'}
        class:dark:bg-sky-400={page.url.pathname === '/blog'}
        class:text-white={page.url.pathname === '/blog'}
        class:dark:text-gray-950={page.url.pathname === '/blog'}
        aria-current={page.url.pathname === '/blog' ? 'page' : undefined}
      >
        Blog
      </a>
    </li>
  </ul>
</nav>
