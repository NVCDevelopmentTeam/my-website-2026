import { getFilteredPosts } from '$lib/data/posts.server'
import { siteConfig } from '$lib/config'
import { error } from '@sveltejs/kit'
import { building } from '$app/environment'

export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url, depends }) {
  // Mark data to reload when navigating
  depends('blog:category')

  const category = params.category
  if (!category) {
    error(400, 'Danh mục không hợp lệ.')
  }

  const perPage = siteConfig.pagination.postsPerPage

  // Get page from query - avoid accessing during prerender
  const pageParam = building ? null : url.searchParams.get('page')
  let currentPage = Number(pageParam)
  if (!currentPage || currentPage < 1) currentPage = 1

  const offset = (currentPage - 1) * perPage

  try {
    // Get data
    const result = await getFilteredPosts({
      offset,
      limit: perPage,
      category
    })

    // Fallback to avoid undefined errors
    const posts = result?.posts ?? []
    const total = result?.total ?? 0
    const totalPages = result?.totalPages ?? 1

    // Check if page exceeds limits
    if (currentPage > totalPages && totalPages > 0) {
      error(404, `Trang ${currentPage} không tồn tại trong danh mục "${category}".`)
    }

    return {
      category,
      posts,
      pagination: {
        currentPage,
        totalPages,
        totalPosts: total,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages
      }
    }
  } catch (err) {
    console.error('Error loading category page:', err)
    error(500, 'Không thể tải bài viết trong danh mục này.')
  }
}
