import { getFilteredPosts } from '$lib/data/posts.server'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  try {
    // Get all posts (no pagination)
    const { posts } = getFilteredPosts()

    // Group tags and count posts in each tag
    const tagMap = new Map()
    for (const post of posts) {
      const tags = post.metadata.tags || []
      for (const tag of tags) {
        if (!tag) continue
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      }
    }

    const uniqueTags = Array.from(tagMap.entries()).map(([title, count]) => ({
      title,
      count
    }))

    // Sort alphabetically
    uniqueTags.sort((a, b) => a.title.localeCompare(b.title))

    return {
      uniqueTags,
      totalTags: uniqueTags.length
    }
  } catch (err) {
    console.error('Error loading tags:', err)
    error(500, 'Không thể tải danh sách thẻ.')
  }
}
