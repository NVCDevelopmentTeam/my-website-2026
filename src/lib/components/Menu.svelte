<script>
  import { page } from '$app/state'
  import { afterNavigate, preloadData } from '$app/navigation'
  import NavLink from './NavLink.svelte'
  import { isLightMode } from '#lib/utils/device.js'
  import { HOME_HREF, pageHref } from '#lib/utils/url.js'

  /** @type {{ navPages?: { slug: string, metadata: { title: string } }[] }} */
  let { navPages = [] } = $props()

  // One list drives both the desktop bar and the mobile overlay. Home comes first and Blog right
  // after it, the other pages follow by title (navPages arrive sorted by title, which used to put
  // "Trang chủ" in the middle of the menu).
  const items = $derived.by(() => {
    const pages = navPages.map((p) => ({ href: pageHref(p.slug), title: p.metadata.title }))

    return [
      ...pages.filter((item) => item.href === HOME_HREF),
      { href: '/blog', title: 'Blog' },
      ...pages.filter((item) => item.href !== HOME_HREF)
    ]
  })

  let isMenuOpen = $state(false)
  /** @type {HTMLDivElement | undefined} */
  let overlay = $state()
  /** @type {HTMLButtonElement | undefined} */
  let openButton = $state()

  function openMenu() {
    isMenuOpen = true
    // The visitor is about to pick a page: load them all now (touch screens have no hover or
    // focus to do it earlier) so the tap that follows feels instant.
    if (!isLightMode()) for (const { href } of items) preloadData(href).catch(() => {})
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
  afterNavigate(({ shallow, type }) => {
    if (shallow && type === 'goto') return

    return isMenuOpen && closeMenu(false)
  })

  // ───────────────────────────────────────────────────────────────────────────────────────────
  // Bar or popup, exactly as in WordPress Twenty Twenty-Five (overlayMenu: "mobile"): from 600 px
  // (37.5em) the menu is a plain list in the header and wraps onto more lines when it needs the
  // room; below that it is the popup button. Nothing is measured in JavaScript, so a window that
  // is resized, zoomed or put in full screen (F11) always lands on the right one. Written in em so
  // that a larger browser text size moves the breakpoint as well.
  // ───────────────────────────────────────────────────────────────────────────────────────────
  let isWide = $state(false)

  $effect(() => {
    const wide = matchMedia('(min-width: 37.5em)')
    const update = () => (isWide = wide.matches)

    update()
    wide.addEventListener('change', update)

    return () => wide.removeEventListener('change', update)
  })

  // The popup is meaningless once the list is back in the bar: close it without moving focus
  $effect(() => {
    if (isWide && isMenuOpen) closeMenu(false)
  })

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

<nav class="min-w-0 flex flex-1 items-center justify-end" aria-label="Điều hướng chính">
  <!-- Menu bar (600 px and wider): a plain list that wraps when it needs the room -->
  <div class="hidden min-w-0 flex-1 items-center justify-end min-[37.5em]:flex">
    <ul
      class="m-0 max-w-full flex flex-wrap list-none items-center justify-end gap-x-3 gap-y-1 border border-gray-200 rounded-2xl bg-white px-4 py-2 shadow-md dark:border-gray-800 dark:bg-gray-950"
    >
      {#each items as { href, title } (href)}
        <li><NavLink {href}>{title}</NavLink></li>
      {/each}
    </ul>
  </div>

  <!-- Popup button + full-screen overlay: below 600 px -->
  <div class="min-[37.5em]:hidden">{@render popup()}</div>
</nav>

{#snippet popup()}
  <button
    bind:this={openButton}
    onclick={openMenu}
    aria-haspopup="dialog"
    class="min-h-[48px] min-w-[48px] flex cursor-pointer items-center justify-center border-0 bg-transparent p-3 text-gray-900 transition-opacity dark:text-gray-100 hover:opacity-70"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4" y="7.5" width="16" height="1.5" fill="currentColor"></rect>

      <rect x="4" y="15" width="16" height="1.5" fill="currentColor"></rect>
    </svg>
    <span class="sr-only">Mở menu</span>
  </button>

  {#if isMenuOpen}
    <div
      bind:this={overlay}
      class="safe-top safe-bottom safe-x fixed inset-0 z-[100000] overflow-y-auto bg-white px-[var(--gutter)] text-gray-950 duration-150 animate-in fade-in dark:bg-gray-950 dark:text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      tabindex="-1"
    >
      <!-- The close button sits where the open button was, at the right of the top row -->
      <div class="min-h-[76px] flex items-center justify-end">
        <button
          onclick={() => closeMenu()}
          aria-label="Đóng menu"
          class="min-h-[48px] min-w-[48px] flex cursor-pointer items-center justify-center border-0 bg-transparent p-3 text-gray-950 transition-opacity dark:text-white hover:opacity-70"
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
            ></path>
          </svg>
        </button>
      </div>

      <!-- As in the WordPress menu: opening it moves focus to the first link (the close button is
             one Shift+Tab back), and the dialog is announced as "Menu" -->
      <ul
        {@attach (list) => list.querySelector('a')?.focus()}
        class="m-0 flex flex-col list-none items-start gap-[clamp(0.25rem,1.5vh,1rem)] p-0 pb-12 pt-[clamp(1.5rem,8vh,4rem)]"
      >
        {#each items as { href, title } (href)}
          <li>
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
{/snippet}
