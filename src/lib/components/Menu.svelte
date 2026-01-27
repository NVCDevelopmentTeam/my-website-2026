<script>
  import { page } from '$app/state';
  /**
   * @typedef {Object} Props
   * @property {any[]} [navPages] - list of Markdown pages { slug, metadata: { title } }
   */
  let { navPages = [] } = $props();
  
  let isMenuOpen = $state(false);
  let containerRef = $state(null);
  let openButtonRef = $state(null);

  function openMenu() {
    isMenuOpen = true;
  }

  function closeMenu() {
    isMenuOpen = false;
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
      
      // Push state to handle mobile Back button
      window.history.pushState({ menuOpen: true }, '');
      
      // Listen for popstate (Back button)
      const handlePopState = () => {
        if (isMenuOpen) {
          closeMenu();
        }
      };
      window.addEventListener('popstate', handlePopState);
      
      requestAnimationFrame(() => {
        const firstLink = containerRef?.querySelector('a');
        if (firstLink) firstLink.focus();
      });

      return () => {
        window.removeEventListener('popstate', handlePopState);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  });
</script>

<!-- Mobile Menu -->
<nav 
  class="flex items-center justify-end lg:hidden"
  aria-label="Menu chính"
>
  <button
    bind:this={openButtonRef}
    onclick={openMenu}
    aria-haspopup="dialog"
    aria-expanded={isMenuOpen}
    class="bg-transparent border-0 cursor-pointer p-2 flex items-center justify-center text-gray-950 dark:text-white hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-sky-800 dark:focus:ring-sky-400 rounded-lg"
  >
    <svg 
      width="24" 
      height="24" 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      aria-hidden="true" 
      focusable="false"
    >
      <rect x="4" y="7.5" width="16" height="2" fill="currentColor" />
      <rect x="4" y="14.5" width="16" height="2" fill="currentColor" />
    </svg>
    <span class="sr-only">Mở menu</span>
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
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-gray-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        onclick={handleBackdropClick}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleBackdropClick(e);
          }
        }}
        role="button"
        tabindex="0"
        aria-label="Đóng menu"
      >
        <!-- Menu Panel -->
        <div
          class="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-950 text-gray-950 dark:text-white overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng"
          tabindex="-1"
          onclick={(e) => e.stopPropagation()}
          onkeydown={(e) => e.stopPropagation()}
        >
          <!-- Close Button -->
          <button
            onclick={closeMenu}
            class="absolute top-5 right-5 bg-transparent border-0 cursor-pointer p-2 flex items-center justify-center text-gray-950 dark:text-white hover:opacity-70 transition-opacity z-10 focus:outline-none focus:ring-2 focus:ring-sky-800 dark:focus:ring-sky-400 rounded-lg"
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
            <span class="sr-only">Đóng menu</span>
          </button>
          
          <!-- Menu Content -->
          <div class="p-8 pt-20">
            <ul 
              class="list-none m-0 p-0 flex flex-col items-start justify-start w-full space-y-2"
            >
              {#each navPages as p (p.slug)}
                <li class="w-full">
                  <a 
                    class="block py-4 px-6 no-underline text-xl rounded-2xl transition-colors font-bold tracking-tight {isCurrentPage(p.slug) ? 'bg-sky-50 text-sky-900 dark:bg-sky-900/30 dark:text-sky-300' : 'text-gray-950 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'}"
                    href={getHref(p.slug)}
                    aria-current={isCurrentPage(p.slug) ? 'page' : undefined}
                    onclick={closeMenu}
                  >
                    {p.metadata.title}
                  </a>
                </li>
              {/each}

              <li class="w-full">
                <a 
                  class="block py-4 px-6 no-underline text-xl rounded-2xl transition-colors font-bold tracking-tight {page.url.pathname === '/blog' ? 'bg-sky-50 text-sky-900 dark:bg-sky-900/30 dark:text-sky-300' : 'text-gray-950 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'}"
                  href="/blog"
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
    </div>
  {/if}
</nav>

<!-- Desktop Menu -->
<nav
  class="hidden lg:block"
  aria-label="Menu chính"
>
  <ul class="flex flex-wrap justify-center items-center gap-2 m-0 p-0 list-none">
    {#each navPages as p (p.slug)}
      <li>
        <a
          href={getHref(p.slug)}
          class="px-5 py-2.5 rounded-2xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-800 dark:focus:ring-sky-400 no-underline inline-block {isCurrentPage(p.slug) ? 'text-sky-900 dark:text-white bg-sky-50 dark:bg-sky-900/20' : 'text-gray-800 dark:text-gray-200 hover:text-sky-800 dark:hover:text-sky-400'}"
          aria-current={isCurrentPage(p.slug) ? 'page' : undefined}
        >
          {p.metadata.title}
        </a>
      </li>
    {/each}

    <li>
      <a
        href="/blog"
        class="px-5 py-2.5 rounded-2xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-800 dark:focus:ring-sky-400 no-underline inline-block {page.url.pathname === '/blog' ? 'text-sky-900 dark:text-white bg-sky-50 dark:bg-sky-900/20' : 'text-gray-800 dark:text-gray-200 hover:text-sky-800 dark:hover:text-sky-400'}"
        aria-current={page.url.pathname === '/blog' ? 'page' : undefined}
      >
        Blog
      </a>
    </li>
  </ul>
</nav>

