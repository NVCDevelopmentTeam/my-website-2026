import { getFilteredPosts } from '$lib/data/posts.server'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  try {
    // Get all posts (no pagination)
    const { posts } = getFilteredPosts()

    // Group categories and count posts in each category
    const categoryMap = new Map()
    for (const post of posts) {
      const categories = post.metadata.categories || []
      for (const cat of categories) {
        if (!cat) continue
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
      }
    }

    const uniqueCategories = Array.from(categoryMap.entries()).map(([title, count]) => ({
      title,
      count
    }))

    // Sort alphabetically
    uniqueCategories.sort((a, b) => a.title.localeCompare(b.title))

    return {
      uniqueCategories,
      totalCategories: uniqueCategories.length
    }
  } catch (err) {
    console.error('Error loading categories:', err)
    error(500, 'Không thể tải danh sách danh mục.')
  }
}
