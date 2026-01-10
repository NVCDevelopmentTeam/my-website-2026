import { getFilteredPosts } from '$lib/data/posts.server'
import { siteConfig } from '$lib/config'
import { error } from '@sveltejs/kit'

export const prerender = false

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, depends }) {
  // Mark data to reload when navigating
  depends('blog:list')

  // Get query params
  const pageParam = url.searchParams.get('page')
  const category = url.searchParams.get('category') || null
  const author = url.searchParams.get('author') || null
  const tag = url.searchParams.get('tag') || null

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
      author,
      tag
    })

    // If page exceeds total pages -> 404
    if (currentPage > totalPages && totalPages > 0) {
      error(404, `Trang ${currentPage} không tồn tại.`)
    }

    return {
      posts,
      pagination: {
        currentPage,
        totalPages,
        totalPosts: total,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages
      },
      filters: {
        category,
        author,
        tag
      },
      site: siteConfig
    }
  } catch (err) {
    console.error('Error loading post list:', err)
    error(500, 'Không thể tải danh sách bài viết.')
  }
}
