import { getFilteredPosts } from '#lib/data/posts.js'
import { siteConfig } from '#lib/config.js'
import { error } from '@sveltejs/kit'
import { loadPaginatedPosts } from '#lib/utils/pagination.js'

export const prerender = true

/** @type {import('./$types').PageLoad} */
export async function load({ url }) {
  try {
    const { posts, pagination } = loadPaginatedPosts(url, {}, getFilteredPosts)

    return {
      posts,
      pagination: { ...pagination, baseUrl: '/blog' },
      site: siteConfig
    }
  } catch (err) {
    console.error('Error loading post list:', err)
    error(500, 'Không thể tải danh sách posts.')
  }
}
