<script>
  import { page } from '$app/state'

  /** @type {{ pages?: { slug: string, metadata: { title: string, menu?: string } }[] }} */
  let { pages = [] } = $props()

  const footerPages = $derived(pages.filter((p) => p.metadata?.menu === 'footer'))

  /** @param {string} slug */
  const hrefOf = (slug) => (slug === 'index' || slug === '' ? '/' : `/${slug}`)
</script>

{#if footerPages.length > 0}
  <ul class="m-0 flex flex-col list-none gap-1 p-0">
    {#each footerPages as { slug, metadata } (slug)}
      <li>
        <!-- Current page: styled from aria-current, see Menu.svelte -->
        <a
          href={hrefOf(slug)}
          aria-current={page.url.pathname === hrefOf(slug) ? 'page' : undefined}
          class="inline-block rounded-sm px-1 py-2.5 text-sm text-gray-950 font-bold transition-colors duration-200 hover:text-sky-800 dark:text-gray-50 dark:hover:text-sky-400 aria-[current=page]:font-black aria-[current=page]:text-sky-900 dark:aria-[current=page]:text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-800 dark:focus:ring-sky-400"
        >
          {metadata.title}
        </a>
      </li>
    {/each}
  </ul>
{/if}
