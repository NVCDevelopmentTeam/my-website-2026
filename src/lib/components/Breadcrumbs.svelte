<script>
  import { page } from '$app/state'
  import { siteConfig } from '#lib/config.js'
  import { serializeSchema } from '#lib/utils/seo.js'

  /** @type {Record<string, string>} Fixed names for the sections of the site */
  const NAMES = {
    blog: 'Blog',
    category: 'Danh mục',
    tag: 'Thẻ',
    contact: 'Liên hệ',
    about: 'Giới thiệu',
    archive: 'Lưu trữ',
    search: 'Tìm kiếm'
  }

  /** Words kept in lower case when a URL slug has to be turned into a title. */
  const SMALL_WORDS = ['và', 'của', 'cho', 'từ', 'với', 'trong', 'ngoài', 'trên', 'dưới']

  /** "my-slug" -> "My slug" (only used when the page itself has no title). */
  function titleFromSlug(/** @type {string} */ slug) {
    return decodeURIComponent(slug)
      .split('-')
      .map((w) =>
        SMALL_WORDS.includes(w.toLowerCase()) ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1)
      )
      .join(' ')
  }

  /** Title of a post, page, category or tag from the site data, found by its URL slug. */
  function titleBySlug(/** @type {string} */ segment) {
    const { recentPosts = [], allPages = [], allCategories = [], allTags = [] } = page.data
    const item = [...recentPosts, ...allPages, ...allCategories, ...allTags].find(
      (i) => (i.slug ?? i.metadata?.slug) === segment
    )
    return item?.metadata?.title ?? item?.name
  }

  /** Title the page being shown gets from its own load function (covers older posts too). */
  const currentTitle = $derived(
    page.data?.post?.metadata?.title || page.data?.page?.metadata?.title
  )

  /** @type {{ name: string, href: string, isActive?: boolean }[]} */
  const crumbs = $derived.by(() => {
    // Pagination URLs (/blog/page/2) belong to /blog: the section stays a link there
    const segments = page.url.pathname.split('/').filter(Boolean)
    const pageAt = segments.indexOf('page')
    const paginated = pageAt !== -1
    const places = paginated ? segments.slice(0, pageAt) : segments
    if (places.length === 0) return []

    return [
      { name: 'Trang chủ', href: '/' },
      ...places.map((segment, i) => {
        const isCurrent = !paginated && i === places.length - 1
        return {
          name:
            NAMES[segment] ||
            (isCurrent && currentTitle) ||
            titleBySlug(segment) ||
            titleFromSlug(segment),
          href: '/' + places.slice(0, i + 1).join('/'),
          isActive: isCurrent
        }
      })
    ]
  })

  const breadcrumbJsonLd = $derived(
    crumbs.length === 0
      ? null
      : {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: `${siteConfig.siteUrl}${crumb.href === '/' ? '' : crumb.href}`
          }))
        }
  )
</script>

<svelte:head>
  {#if breadcrumbJsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html serializeSchema(breadcrumbJsonLd)}
  {/if}
</svelte:head>

{#if crumbs.length > 0}
  <nav
    aria-label="Đường dẫn trang"
    class="mb-6 flex overflow-x-auto whitespace-nowrap px-4 py-4 sm:px-6"
  >
    <ol class="flex list-none items-center text-sm text-gray-950 space-x-2 dark:text-gray-50">
      {#each crumbs as crumb, i (crumb.href)}
        <li class="flex items-center">
          <!-- Separator icon -->
          {#if i > 0}
            <svg
              class="mx-2 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          {/if}

          <!-- Current page (no link) -->
          {#if crumb.isActive}
            <span
              class="max-w-[200px] truncate text-gray-950 font-black sm:max-w-md dark:text-gray-50"
              aria-current="page"
            >
              {crumb.name}
            </span>
            <!-- Link to previous pages -->
          {:else}
            <a
              href={crumb.href}
              class="text-gray-950 font-bold transition-colors dark:text-gray-50 hover:text-sky-800 dark:hover:text-sky-400"
            >
              {crumb.name}
            </a>
          {/if}
        </li>
      {/each}
    </ol>
  </nav>
{/if}
