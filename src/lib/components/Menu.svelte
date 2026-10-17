<script>
  import { page } from '$app/state'
  import { preloadData } from '$app/navigation'
  import { preloadOnFocus } from '#lib/actions/preloadOnFocus.js'

  /**
   * @typedef {Object} Props
   * @property {any[]} [navPages] - list of Markdown pages { slug, metadata: { title } }
   */
  let { navPages = [] } = $props()

  // Desktop link states: every colour property is set by exactly one class (current OR idle),
  // never by two competing utilities. Competing utilities (e.g. `text-gray-50` + `text-gray-950`)
  // are resolved by stylesheet order, which differs between the dev server and the production
  // build, and left white text on the light-blue current item in dark mode (contrast failure).
  let isMenuOpen = $state(false)
  /** @type {HTMLDivElement | null} */
  let containerRef = $state(null)
  /** @type {HTMLButtonElement | null} */
  let openButtonRef = $state(null)

  function openMenu() {
    isMenuOpen = true
    // The visitor is about to pick one of these pages: start loading them now (touch screens
    // have no hover or focus to do it earlier) so the tap that follows feels instant.
    for (const href of [...navPages.map((p) => getHref(p.slug)), '/blog']) {
      preloadData(href).catch(() => {})
    }
  }

  /**
   * @param {boolean} [restoreFocus] Give focus back to the menu button. Not wanted when a link
   *   was chosen: the page is about to change and SvelteKit moves focus itself, so focusing the
   *   button first made screen readers read "Mở menu, button" before the new page.
   */
  function closeMenu(restoreFocus = true) {
    isMenuOpen = false
    if (restoreFocus && openButtonRef) {
      requestAnimationFrame(() => openButtonRef?.focus())
    }
  }

  /** @param {KeyboardEvent} event */
  function handleMenuKeydown(event) {
    if (event.key === 'Escape' && isMenuOpen) {
      closeMenu()
    }
  }

  /** @param {FocusEvent & { currentTarget: HTMLElement }} event */
  function handleMenuFocusout(event) {
    const container = event.currentTarget
    requestAnimationFrame(() => {
      // Focus left the menu (tabbed out, or the chosen link was removed while the page
      // changes). Close it, but leave focus where it went instead of pulling it back to the
      // button.
      if (isMenuOpen && container && !container.contains(document.activeElement)) {
        closeMenu(false)
      }
    })
  }

  /** @param {string} slug */
  function getHref(slug) {
    return slug === 'index' || slug === '' ? '/' : `/${slug}`
  }

  /** @param {string} slug */
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

<nav class="flex items-center justify-end" aria-label="Điều hướng chính">
  <!-- Desktop Menu -->
  <div
    class="relative hidden border border-gray-200 rounded-2xl bg-white px-4 py-2 shadow-md md:block dark:border-gray-800 dark:bg-gray-950"
  >
    <ul class="m-0 flex flex-wrap list-none items-center justify-center gap-3 p-0">
      {#each navPages as p (p.slug)}
        <li>
          <a
            href={getHref(p.slug)}
            data-sveltekit-preload-data="hover"
            class="inline-block rounded-xl px-4 py-2 font-black no-underline transition-[background-color,color] duration-200 focus:outline-none focus:ring-2 focus:ring-sky-800"
            class:bg-sky-800={isCurrentPage(p.slug)}
            class:text-white={isCurrentPage(p.slug)}
            class:dark:bg-sky-400={isCurrentPage(p.slug)}
            class:dark:text-gray-950={isCurrentPage(p.slug)}
            class:text-gray-950={!isCurrentPage(p.slug)}
            class:hover:bg-sky-800={!isCurrentPage(p.slug)}
            class:hover:text-white={!isCurrentPage(p.slug)}
            class:dark:text-gray-50={!isCurrentPage(p.slug)}
            class:dark:hover:bg-sky-400={!isCurrentPage(p.slug)}
            class:dark:hover:text-gray-950={!isCurrentPage(p.slug)}
            use:preloadOnFocus
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
          class="inline-block rounded-xl px-4 py-2 font-black no-underline transition-[background-color,color] duration-200 focus:outline-none focus:ring-2 focus:ring-sky-800"
          class:bg-sky-800={page.url.pathname === '/blog'}
          class:text-white={page.url.pathname === '/blog'}
          class:dark:bg-sky-400={page.url.pathname === '/blog'}
          class:dark:text-gray-950={page.url.pathname === '/blog'}
          class:text-gray-950={!(page.url.pathname === '/blog')}
          class:hover:bg-sky-800={!(page.url.pathname === '/blog')}
          class:hover:text-white={!(page.url.pathname === '/blog')}
          class:dark:text-gray-50={!(page.url.pathname === '/blog')}
          class:dark:hover:bg-sky-400={!(page.url.pathname === '/blog')}
          class:dark:hover:text-gray-950={!(page.url.pathname === '/blog')}
          use:preloadOnFocus
          aria-current={page.url.pathname === '/blog' ? 'page' : undefined}
        >
          Blog
        </a>
      </li>
    </ul>
  </div>

  <!-- Mobile Menu -->
  <div class="flex items-center justify-end md:hidden">
    <button
      bind:this={openButtonRef}
      onclick={openMenu}
      aria-haspopup="dialog"
      class="min-h-[48px] min-w-[48px] flex cursor-pointer items-center justify-center border-0 bg-transparent p-3 text-gray-900 transition-opacity dark:text-gray-100 hover:opacity-70"
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
      <span class="sr-only">Mở menu</span>
    </button>

    {#if isMenuOpen}
      <div
        bind:this={containerRef}
        class="fixed inset-0 z-[100000]"
        role="presentation"
        onfocusout={handleMenuFocusout}
        onkeydown={handleMenuKeydown}
      >
        <!-- Full-screen menu overlay -->
        <div
          class="safe-top safe-bottom safe-x fixed inset-0 overflow-y-auto bg-white text-gray-950 duration-150 animate-in fade-in dark:bg-gray-950 dark:text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          tabindex="-1"
        >
          <!-- Close Button -->
          <button
            onclick={() => closeMenu()}
            aria-label="Đóng menu"
            class="absolute right-5 top-5 z-10 min-h-[48px] min-w-[48px] flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 text-gray-950 transition-opacity dark:text-white hover:opacity-70"
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
          </button>

          <!-- Menu Content -->
          <div class="p-8 pt-20">
            <ul class="m-0 w-full flex flex-col list-none items-start justify-start p-0 space-y-1">
              {#each navPages as p (p.slug)}
                <li class="w-full">
                  <a
                    class="block rounded-lg px-4 py-3 text-lg text-gray-950 font-bold no-underline transition-colors hover:bg-gray-100 dark:text-gray-50 -tracking-[0.1px] dark:hover:bg-gray-900"
                    class:font-black={isCurrentPage(p.slug)}
                    class:bg-gray-100={isCurrentPage(p.slug)}
                    class:dark:bg-gray-900={isCurrentPage(p.slug)}
                    href={getHref(p.slug)}
                    data-sveltekit-preload-data="hover"
                    use:preloadOnFocus
                    aria-current={isCurrentPage(p.slug) ? 'page' : undefined}
                    onclick={() => closeMenu(isCurrentPage(p.slug))}
                  >
                    {p.metadata.title}
                  </a>
                </li>
              {/each}

              <li class="w-full">
                <a
                  class="block rounded-lg px-4 py-3 text-lg text-gray-950 font-bold no-underline transition-colors hover:bg-gray-100 dark:text-gray-50 -tracking-[0.1px] dark:hover:bg-gray-900"
                  class:font-black={page.url.pathname === '/blog'}
                  class:bg-gray-100={page.url.pathname === '/blog'}
                  class:dark:bg-gray-900={page.url.pathname === '/blog'}
                  href="/blog"
                  data-sveltekit-preload-data="hover"
                  use:preloadOnFocus
                  aria-current={page.url.pathname === '/blog' ? 'page' : undefined}
                  onclick={() => closeMenu(page.url.pathname === '/blog')}
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    {/if}
  </div>
</nav>
