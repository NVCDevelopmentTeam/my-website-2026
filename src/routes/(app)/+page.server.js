import { getFilteredPosts } from '#lib/data/posts.js'
import { error } from '@sveltejs/kit'

export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  try {
    var { posts: latestPosts } = getFilteredPosts({ offset: 0, limit: 3 })
    return {
      latestPosts
    }
  } catch (err) {
    console.error('Error loading home page data:', err)
    error(500, 'Internal Server Error')
  }
}
