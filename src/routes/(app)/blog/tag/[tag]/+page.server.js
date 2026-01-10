import { getFilteredPosts } from '$lib/data/posts.server'
import { siteConfig } from '$lib/config'
import { error } from '@sveltejs/kit'

export const prerender = false

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
  const tag = params.tag

  if (!tag) {
    error(400, 'Thẻ không hợp lệ.')
  }

  // Current page
  const pageParam = url.searchParams.get('page')
  const currentPage =
    pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0 ? Number(pageParam) : 1

  const perPage = siteConfig.pagination.postsPerPage
  const offset = (currentPage - 1) * perPage

  try {
    const { posts, total, totalPages } = getFilteredPosts({
      offset,
      limit: perPage,
      tag
    })

    // Check for page overflow
    if (currentPage > totalPages && totalPages > 0) {
      error(404, `Trang ${currentPage} không tồn tại trong tag "${tag}".`)
    }

    return {
      tag,
      posts,
      pagination: {
        currentPage,
        totalPages,
        totalPosts: total,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages
      },
      site: siteConfig
    }
  } catch (err) {
    console.error('Error loading Tag page:', err)
    error(500, 'Không thể tải bài viết theo thẻ này.')
  }
}
