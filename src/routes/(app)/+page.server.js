import { getFilteredPosts } from '$lib/data/posts'

export const prerender = true

export async function load() {
  // Fetch recent posts (top 10)
  const { posts: recentPosts } = getFilteredPosts({ offset: 0, limit: 10 })

  return {
    recentPosts
  }
}
