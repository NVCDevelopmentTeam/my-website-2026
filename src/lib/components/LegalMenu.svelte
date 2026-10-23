<script>
  import NavLink from './NavLink.svelte'
  import { pageHref } from '#lib/utils/url.js'

  /** @type {{ pages?: { slug: string, metadata: { title: string, menu?: string } }[] }} */
  let { pages = [] } = $props()

  const footerPages = $derived(pages.filter((p) => p.metadata?.menu === 'footer'))
</script>

{#if footerPages.length > 0}
  <ul class="m-0 flex flex-col list-none gap-1 p-0">
    {#each footerPages as { slug, metadata } (slug)}
      <li>
        <NavLink href={pageHref(slug)} variant="footer">
          {metadata.title}
        </NavLink>
      </li>
    {/each}
  </ul>
{/if}
