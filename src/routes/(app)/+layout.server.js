import { getAllPages } from '$lib/data/pages.server'
import { getFilteredPosts } from '$lib/data/posts.server'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
  try {
    const pages = await getAllPages()

    // Get the latest posts, first page, no special filters
    const { posts: allLatest } = getFilteredPosts({
      offset: 0,
      limit: 5
    })

    const latestPosts = allLatest // Limited to 5 posts

    return {
      pages,
      latestPosts
    }
  } catch (err) {
    console.error('Error loading layout:', err)
    error(500, 'Không thể tải dữ liệu giao diện.')
  }
}
