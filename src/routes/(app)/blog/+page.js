import { getFilteredPosts } from '$lib/data/posts'
import { siteConfig } from '$lib/config'
import { error } from '@sveltejs/kit'
import { loadPaginatedPosts } from '$lib/utils/pagination'

export const prerender = true

/** @type {import('./$types').PageLoad} */
export async function load({ url, depends }) {
  depends('blog:list')

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
