<script>
  import { page } from '$app/state';

  /**
   * @typedef {Object} Props
   * @property {any[]} [navPages] - list of Markdown pages { slug, metadata: { title } }
   */
  // Taking navPages directly from props as discussed
  let { navPages = [] } = $props();
  
  let isMenuOpen = $state(false);
  let containerRef = $state(null);
  let openButtonRef = $state(null);

  function openMenu() {
    isMenuOpen = true;
  }

  function closeMenu() {
    isMenuOpen = false;
    // Focus back to open button after closing
    if (openButtonRef) {
      requestAnimationFrame(() => openButtonRef?.focus());
    }
  }

  function handleMenuKeydown(event) {
    if (event.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  }

  function handleMenuFocusout(event) {
    const container = event.currentTarget;
    requestAnimationFrame(() => {
      if (container && !container.contains(document.activeElement)) {
        closeMenu();
      }
    });
  }

  function handleBackdropClick(event) {
    // Close menu when clicking on backdrop (the overlay div)
    if (event.target === event.currentTarget) {
      closeMenu();
    }
  }

  function getHref(slug) {
    return slug === 'index' || slug === '' ? '/' : `/${slug}`;
  }

  function isCurrentPage(slug) {
    const href = getHref(slug);
    return page.url.pathname === href;
  }

  $effect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Focus first link when menu opens
      requestAnimationFrame(() => {
        const firstLink = containerRef?.querySelector('a');
        if (firstLink) firstLink.focus();
      });
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  });
</script>

<nav 
  class="flex items-center justify-end lg:hidden"
  aria-label="Thực đơn"
>
  <button
    bind:this={openButtonRef}
    onclick={openMenu}
    aria-haspopup="dialog"
    aria-label="Mở menu"
    class="bg-transparent border-0 cursor-pointer p-2 flex items-center justify-center text-gray-900 dark:text-gray-100 hover:opacity-70 transition-opacity"
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
  </button>

  {#if isMenuOpen}
    <div
      bind:this={containerRef}
      class="fixed inset-0 z-[100000]"
      role="presentation"
      tabindex="-1"
      onfocusout={handleMenuFocusout}
      onkeydown={handleMenuKeydown}
    >
      <div 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onclick={handleBackdropClick}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleBackdropClick(e);
          }
        }}
        role="button"
        tabindex="0"
      >
        <div
          class="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300"
          role="dialog"
          aria-label="Thực đơn"
        >
          <button
            onclick={closeMenu}
            aria-label="Đóng menu"
            class="absolute top-5 right-5 bg-transparent border-0 cursor-pointer p-2 flex items-center justify-center text-gray-900 dark:text-gray-100 hover:opacity-70 transition-opacity"
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
              <path d="m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z" />
            </svg>
          </button>
          
          <div class="p-8 pt-20" id="modal-1-content">
            <ul class="list-none m-0 p-0 flex flex-col items-start justify-start w-full">
              {#each navPages as p (p.slug)}
                <li class="w-full">
                  <a 
                    class="block py-3 px-0 no-underline text-gray-900 dark:text-gray-100 text-lg hover:underline font-normal -tracking-[0.1px]"
                    class:font-bold={isCurrentPage(p.slug)}
                    href={getHref(p.slug)}
                    aria-current={isCurrentPage(p.slug) ? 'page' : undefined}
                  >
                    {p.metadata.title}
                  </a>
                </li>
              {/each}

              <li class="w-full">
                <a 
                  class="block py-3 px-0 no-underline text-gray-900 dark:text-gray-100 text-lg hover:underline font-normal -tracking-[0.1px]"
                  class:font-bold={page.url.pathname === '/blog'}
                  href="/blog"
                  aria-current={page.url.pathname === '/blog' ? 'page' : undefined}
                >
                  Bài viết
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  {/if}
</nav>

<nav
  class="hidden lg:block relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md px-4 py-2"
  aria-label="menu chính"
>
  <ul class="flex flex-wrap justify-center items-center gap-3">
    {#each navPages as p (p.slug)}
      <li>
        <a
          href={getHref(p.slug)}
          class="px-4 py-2 rounded-xl font-medium text-gray-800 dark:text-gray-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-current={isCurrentPage(p.slug) ? 'page' : undefined}
        >
          {p.metadata.title}
        </a>
      </li>
    {/each}

    <li>
      <a
        href="/blog"
        class="px-4 py-2 rounded-xl font-medium text-gray-800 dark:text-gray-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-current={page.url.pathname === '/blog' ? 'page' : undefined}
      >
        Bài viết
      </a>
    </li>
  </ul>
</nav>