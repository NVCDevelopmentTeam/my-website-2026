// @ts-nocheck
import { getAllPages } from '$lib/data/pages'
import { getFilteredPosts, getAllCategories, getAllTags } from '$lib/data/posts'
import { error } from '@sveltejs/kit'

export const prerender = true
/** @param {Parameters<import('./$types').LayoutServerLoad>[0]} event */
export async function load({ setHeaders }) {
  // Set cache headers for better performance
  setHeaders({
    'cache-control': 'public, max-age=3600'
  })

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
