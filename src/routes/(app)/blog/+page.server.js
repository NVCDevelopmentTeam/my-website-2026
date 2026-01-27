import { getFilteredPosts } from '$lib/data/posts.server'
import { siteConfig } from '$lib/config'
import { error } from '@sveltejs/kit'
import { building } from '$app/environment'

export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, depends }) {
  // Mark data to reload when navigating
  depends('blog:list')

  // Get query params - avoid accessing during prerender
  const pageParam = building ? null : url.searchParams.get('page')
  const category = building ? null : url.searchParams.get('category')
  const tag = building ? null : url.searchParams.get('tag')

  // Process page
  let currentPage = Number(pageParam) || 1
  if (currentPage < 1) currentPage = 1

  try {
    const perPage = siteConfig.pagination.postsPerPage
    const offset = (currentPage - 1) * perPage

    // Get posts with filters
    const { posts, total, totalPages } = getFilteredPosts({
      offset,
      limit: perPage,
      category,
      tag
    })

    // If page exceeds total pages -> 404
    if (currentPage > totalPages && totalPages > 0) {
      error(404, `Trang ${currentPage} không tồn tại.`)
    }

    return {
      posts,
      // Metadata for Pagination component - clean & simple
      metadata: {
        page: currentPage,
        total: total
        // baseUrl will be auto-detected from URL path by Pagination component
        // No need to pass it here!
      },
      filters: {
        category,
        tag
      },
      site: siteConfig
    }
  } catch (err) {
    console.error('Error loading post list:', err)
    error(500, 'Không thể tải danh sách posts.')
  }
}
