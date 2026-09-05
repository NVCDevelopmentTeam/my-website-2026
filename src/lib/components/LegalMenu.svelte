<script>
  import { page } from '$app/state'

  /**
   * @typedef {Object} Props
   * @property {any[]} [pages] - Full list of Markdown pages from layout
   */
  let { pages = [] } = $props()

  // Filter pages for Footer based on metadata
  let footerPages = $derived(pages.filter((p) => p.metadata?.menu === 'footer'))

  /**
   * Convert slug to URL.
   * Matches main Menu logic for consistency.
   */
  function getHref(slug) {
    return slug === 'index' || slug === '' ? '/' : `/${slug}`
  }

  function isCurrentPage(slug) {
    const href = getHref(slug)
    return page.url.pathname === href
  }
</script>

{#if footerPages.length > 0}
  <div>
    <ul class="flex flex-col list-none gap-1">
      {#each footerPages as p (p.slug)}
        <li>
          <a
            href={getHref(p.slug)}
            class="inline-block rounded-sm px-1 py-2.5 text-sm text-gray-950 font-bold transition-colors duration-200 dark:text-gray-50 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-800 dark:hover:text-sky-400 dark:focus:ring-sky-400"
            class:font-black={isCurrentPage(p.slug)}
            class:text-sky-900={isCurrentPage(p.slug)}
            class:dark:text-sky-300={isCurrentPage(p.slug)}
            aria-current={isCurrentPage(p.slug) ? 'page' : undefined}
          >
            {p.metadata.title}
          </a>
        </li>
      {/each}
    </ul>
  </div>
{/if}
