import { getFilteredPosts } from '$lib/data/posts'
import { siteConfig } from '$lib/config'
import { error } from '@sveltejs/kit'
import { building } from '$app/environment'

export const prerender = true

/** @type {import('./$types').PageLoad} */
export async function load({ url, depends }) {
  depends('blog:list')

  try {
    const perPage = siteConfig.pagination.postsPerPage
    // During building, url.searchParams is not available
    const pageParam = building ? null : url.searchParams.get('page')
    let currentPage = parseInt(pageParam || '1')
    if (isNaN(currentPage) || currentPage < 1) currentPage = 1

    const offset = (currentPage - 1) * perPage

    // Get posts with pagination support
    const { posts, total, totalPages } = getFilteredPosts({
      offset,
      limit: perPage
    })

    return {
      posts,
      pagination: {
        currentPage,
        totalPages: totalPages || Math.ceil(total / perPage),
        totalPosts: total,
        baseUrl: '/blog'
      },
      site: siteConfig
    }
  } catch (err) {
    console.error('Error loading post list:', err)
    error(500, 'Không thể tải danh sách posts.')
  }
}
