import { getAllPages } from '$lib/data/pages'
import { getFilteredPosts, getAllCategories, getAllTags } from '$lib/data/posts'
import { error } from '@sveltejs/kit'

export const prerender = true

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ setHeaders }) {
  // Cache headers for static site performance
  setHeaders({
    'cache-control': 'public, max-age=3600'
  })

  try {
    var { pages: allPages } = getAllPages()
    var { pages: navPages } = getAllPages({ menu: 'nav' })
    var { posts: recentPosts } = getFilteredPosts({ offset: 0, limit: 5 })
    var allCategories = getAllCategories()
    var allTags = getAllTags()

    return {
      allPages,
      navPages,
      recentPosts,
      allCategories,
      allTags
    }
  } catch (err) {
    console.error('Error loading layout data:', err)
    error(500, 'Internal Server Error')
  }
}
