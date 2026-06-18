import { siteConfig } from '$lib/config'
import { building } from '$app/environment'

/**
 * Compute paginated listing parameters from a SvelteKit URL and call
 * `getFilteredPosts` with the right offset / limit.
 *
 * Centralises the duplicated logic that was in:
 *   - blog/+page.js
 *   - blog/category/[category]/+page.js
 *   - blog/tag/[tag]/+page.js
 *
 * @param {URL}    url           - The request URL (for ?page= query param).
 * @param {Object} [filters={}]  - Extra filters forwarded to `getFilteredPosts`
 *                                 (e.g. `{ category: 'Tech' }` or `{ tag: 'svelte' }`).
 * @param {typeof import('$lib/data/posts').getFilteredPosts} getFilteredPosts
 * @returns {{ posts: any[], pagination: object }}
 */
export function loadPaginatedPosts(url, filters, getFilteredPosts) {
  const perPage = siteConfig.pagination.postsPerPage

  const pageParam = building ? null : url.searchParams.get('page')
  let currentPage = parseInt(pageParam || '1')
  if (isNaN(currentPage) || currentPage < 1) currentPage = 1

  const offset = (currentPage - 1) * perPage

  const { posts, total, totalPages } = getFilteredPosts({
    offset,
    limit: perPage,
    ...filters
  })

  return {
    posts,
    pagination: {
      currentPage,
      totalPages: totalPages || Math.ceil(total / perPage),
      totalPosts: total,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages
    }
  }
}
