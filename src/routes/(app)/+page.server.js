import { getFilteredPosts } from '$lib/data/posts'
import { error } from '@sveltejs/kit'

export const prerender = true

export async function load() {
  try {
    const { posts: recentPosts } = getFilteredPosts({ offset: 0, limit: 10 })

    return {
      recentPosts
    }
  } catch (err) {
    console.error('Error loading recent posts:', err)
    error(500, 'Không thể tải bài viết mới nhất.')
  }
}
