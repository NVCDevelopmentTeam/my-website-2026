import { getAllPages } from '$lib/data/pages.server'
import { getFilteredPosts, getAllCategories, getAllTags } from '$lib/data/posts.server'
import { error } from '@sveltejs/kit'

export const prerender = true
/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
  try {
    // Get all pages to support Logo/Search/Breadcrumbs
    const { pages: allPages } = getAllPages()

    // Get only pages assigned to the 'nav' menu
    const { pages: navPages } = getAllPages({ menu: 'nav' })

    // Get the 5 most recent posts for sidebar/footer
    const { posts: recentPosts } = getFilteredPosts({ offset: 0, limit: 5 })

    // Get all categories for sidebar and Breadcrumbs
    const allCategories = getAllCategories()

    const allTags = getAllTags()
    return {
      allPages,
      navPages,
      recentPosts,
      allCategories,
      allTags
    }
  } catch (err) {
    console.error('Error loading layout data:', err)
    // Standard error handling for SvelteKit
    error(500, 'Internal Server Error')
  }
}
