<script>
  import { page } from '$app/state'
  import { preloadData } from '$app/navigation'

  /** @type {{ navPages?: { slug: string, metadata: { title: string } }[] }} */
  let { navPages = [] } = $props()

  // One list drives both the desktop bar and the mobile overlay.
  const items = $derived([
    ...navPages.map((p) => ({
      href: p.slug === 'index' || p.slug === '' ? '/' : `/${p.slug}`,
      title: p.metadata.title
    })),
    { href: '/blog', title: 'Blog' }
  ])

  let isMenuOpen = $state(false)
  /** @type {HTMLDivElement | undefined} */
  let overlay = $state()
  /** @type {HTMLButtonElement | undefined} */
  let openButton = $state()

  function openMenu() {
    isMenuOpen = true
    // The visitor is about to pick a page: load them all now (touch screens have no hover or
    // focus to do it earlier) so the tap that follows feels instant.
    for (const { href } of items) preloadData(href).catch(() => {})
  }

  /**
   * @param {boolean} [restoreFocus] Give focus back to the menu button. Not wanted when a link
   *   was chosen: the page is about to change and SvelteKit moves focus itself, so focusing the
   *   button first made screen readers read "Mở menu, button" before the new page.
   */
  function closeMenu(restoreFocus = true) {
    isMenuOpen = false
    if (restoreFocus) requestAnimationFrame(() => openButton?.focus())
  }

  // Lock the page scroll while the overlay is open and move focus into it.
  $effect(() => {
    if (!isMenuOpen) return
    document.documentElement.classList.add('menu-open')
    requestAnimationFrame(() => overlay?.querySelector('a')?.focus())
    return () => document.documentElement.classList.remove('menu-open')
  })
</script>

<!--
  Current page: the link itself carries aria-current="page" and the styling is driven by that
  attribute (aria-[current=page]:). Each colour is set by selectors of different specificity, so
  the result never depends on stylesheet order.
-->
<nav class="flex items-center justify-end" aria-label="Điều hướng chính">
  <!-- Desktop bar -->
  <ul
    class="m-0 hidden flex-wrap list-none items-center justify-center gap-3 border border-gray-200 rounded-2xl bg-white px-4 py-2 shadow-md md:flex dark:border-gray-800 dark:bg-gray-950"
  >
    {#each items as { href, title } (href)}
      <li>
        <a
          {href}
          aria-current={page.url.pathname === href ? 'page' : undefined}
          class="inline-block rounded-xl px-4 py-2 text-gray-950 font-black no-underline transition-[background-color,color] duration-200 hover:bg-sky-800 hover:text-white dark:text-gray-50 dark:hover:bg-sky-400 dark:hover:text-gray-950 aria-[current=page]:bg-sky-800 aria-[current=page]:text-white dark:aria-[current=page]:bg-sky-400 dark:aria-[current=page]:text-gray-950 focus:outline-none focus:ring-2 focus:ring-sky-800"
        >
          {title}
        </a>
      </li>
    {/each}
  </ul>

  <!-- Mobile button + full-screen overlay -->
  <div class="md:hidden">
    <button
      bind:this={openButton}
      onclick={openMenu}
      aria-haspopup="dialog"
      class="min-h-[48px] min-w-[48px] flex cursor-pointer items-center justify-center border-0 bg-transparent p-3 text-gray-900 transition-opacity dark:text-gray-100 hover:opacity-70"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="4" y="7.5" width="16" height="1.5" fill="currentColor" />
        <rect x="4" y="15" width="16" height="1.5" fill="currentColor" />
      </svg>
      <span class="sr-only">Mở menu</span>
    </button>

    {#if isMenuOpen}
      <!-- Focus leaving the overlay (Tab past the last link, or the chosen link being removed
           while the page changes) closes it, without pulling focus back to the button. -->
      <div
        bind:this={overlay}
        class="safe-top safe-bottom safe-x fixed inset-0 z-[100000] overflow-y-auto bg-white text-gray-950 duration-150 animate-in fade-in dark:bg-gray-950 dark:text-white"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        tabindex="-1"
        onkeydown={(e) => e.key === 'Escape' && closeMenu()}
        onfocusout={() =>
          requestAnimationFrame(() => {
            if (isMenuOpen && !overlay?.contains(document.activeElement)) closeMenu(false)
          })}
      >
        <button
          onclick={() => closeMenu()}
          aria-label="Đóng menu"
          class="absolute right-5 top-5 z-10 min-h-[48px] min-w-[48px] flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 text-gray-950 transition-opacity dark:text-white hover:opacity-70"
        >
          <svg
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

        <ul
          class="m-0 w-full flex flex-col list-none items-start justify-start p-8 pt-20 space-y-1"
        >
          {#each items as { href, title } (href)}
            <li class="w-full">
              <a
                {href}
                aria-current={page.url.pathname === href ? 'page' : undefined}
                onclick={() => closeMenu(page.url.pathname === href)}
                class="block rounded-lg px-4 py-3 text-lg text-gray-950 font-bold no-underline transition-colors hover:bg-gray-100 dark:text-gray-50 -tracking-[0.1px] dark:hover:bg-gray-900 aria-[current=page]:bg-gray-100 aria-[current=page]:font-black dark:aria-[current=page]:bg-gray-900"
              >
                {title}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</nav>
