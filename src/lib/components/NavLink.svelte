<script>
  import { page } from '$app/state'

  /**
   * One navigation link for every menu (desktop bar, mobile overlay, footer, logo). It marks itself as
   * the current page with aria-current, and its styling is driven by that attribute
   * (aria-[current=page]:), so a colour never depends on stylesheet order.
   *
   * @type {{
   *   href: string,
   *   variant?: 'bar' | 'list' | 'footer' | 'logo',
   *   onclick?: () => void,
   *   children: import('svelte').Snippet
   * }}
   */
  let { href, variant = 'bar', onclick, children } = $props()

  const current = $derived(page.url.pathname === href ? 'page' : undefined)
</script>

{#if variant === 'logo'}
  <a
    {href}
    {onclick}
    aria-current={current}
    class="min-h-[48px] min-w-[48px] flex items-center gap-2 rounded-full p-1.5 text-lg text-gray-950 font-bold transition-colors duration-200 dark:text-gray-50 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-800 dark:hover:text-sky-400 dark:focus:ring-sky-400"
  >
    {@render children()}
  </a>
{:else if variant === 'list'}
  <a
    {href}
    {onclick}
    aria-current={current}
    class="min-h-[48px] inline-flex items-center rounded-sm py-1 text-[length:var(--fs-menu)] text-gray-950 font-semibold leading-tight decoration-[0.09em] underline-offset-[0.2em] no-underline dark:text-gray-50 aria-[current=page]:underline hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-800 dark:focus-visible:ring-sky-400"
  >
    {@render children()}
  </a>
{:else if variant === 'footer'}
  <a
    {href}
    {onclick}
    aria-current={current}
    class="inline-block rounded-sm px-1 py-2.5 text-sm text-gray-950 font-bold transition-colors duration-200 aria-[current=page]:text-sky-900 dark:text-gray-50 hover:text-sky-800 aria-[current=page]:font-black focus:outline-none focus:ring-2 focus:ring-sky-800 dark:aria-[current=page]:text-sky-300 dark:hover:text-sky-400 dark:focus:ring-sky-400"
  >
    {@render children()}
  </a>
{:else}
  <a
    {href}
    {onclick}
    aria-current={current}
    class="inline-block rounded-xl px-4 py-2 text-gray-950 font-black no-underline transition-[background-color,color] duration-200 aria-[current=page]:bg-sky-800 hover:bg-sky-800 aria-[current=page]:text-white dark:text-gray-50 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-800 dark:aria-[current=page]:bg-sky-400 dark:hover:bg-sky-400 dark:aria-[current=page]:text-gray-950 dark:hover:text-gray-950"
  >
    {@render children()}
  </a>
{/if}
