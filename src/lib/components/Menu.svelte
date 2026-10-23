<script>
  import { page } from '$app/state'
  import { afterNavigate, preloadData } from '$app/navigation'
  import NavLink from './NavLink.svelte'
  import { pageHref } from '#lib/utils/url.js'

  /** @type {{ navPages?: { slug: string, metadata: { title: string } }[] }} */
  let { navPages = [] } = $props()

  // One list drives both the desktop bar and the mobile overlay.
  const items = $derived([
    ...navPages.map((p) => ({
      href: pageHref(p.slug),
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

  // A chosen link keeps the overlay open until the new page has loaded: closing it at once handed
  // the screen reader back to the old page, which it then described (old title) before the new one.
  afterNavigate(() => isMenuOpen && closeMenu(false))

  /** Esc closes the overlay; Tab and Shift+Tab cycle inside it (it is modal). @param {KeyboardEvent} e */
  function onKeydown(e) {
    if (!isMenuOpen || !overlay) return
    if (e.key === 'Escape') return closeMenu()
    if (e.key !== 'Tab') return

    const focusable = /** @type {NodeListOf<HTMLElement>} */ (
      overlay.querySelectorAll('button, a[href]')
    )
    const [first, last] = [focusable[0], focusable[focusable.length - 1]]
    const edge = e.shiftKey ? first : last
    if (document.activeElement === edge) {
      e.preventDefault()
      ;(e.shiftKey ? last : first).focus()
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<nav class="flex items-center justify-end" aria-label="Điều hướng chính">
  <!-- Desktop bar -->
  <ul
    class="m-0 hidden flex-wrap list-none items-center justify-center gap-3 border border-gray-200 rounded-2xl bg-white px-4 py-2 shadow-md md:flex dark:border-gray-800 dark:bg-gray-950"
  >
    {#each items as { href, title } (href)}
      <li><NavLink {href}>{title}</NavLink></li>
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
      <div
        bind:this={overlay}
        class="safe-top safe-bottom safe-x fixed inset-0 z-[100000] overflow-y-auto bg-white text-gray-950 duration-150 animate-in fade-in dark:bg-gray-950 dark:text-white"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        tabindex="-1"
      >
        <button
          {@attach (button) => button.focus()}
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
              <NavLink
                {href}
                variant="list"
                onclick={() => href === page.url.pathname && closeMenu()}
              >
                {title}
              </NavLink>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</nav>
