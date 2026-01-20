import { getAllPages } from '$lib/data/pages.server'
import { getFilteredPosts } from '$lib/data/posts.server'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
  try {
    // Get all pages to support Logo/Search/Breadcrumbs
    const { pages: allPages } = getAllPages()

    // Get only pages assigned to the 'nav' menu
    const { pages: navPages } = getAllPages({ menu: 'nav' })

    // Get ALL posts for Breadcrumbs to match slugs
    const { posts: allPosts } = getFilteredPosts()

    // Get the 5 most recent posts for sidebar/footer
    const { posts: recentPosts } = getFilteredPosts({ offset: 0, limit: 5 })

    return {
      allPages,
      navPages,
      posts: allPosts, // ← Thêm dòng này để Breadcrumbs có data!
      recentPosts
    }
  } catch (err) {
    console.error('Error loading layout data:', err)
    // Standard error handling for SvelteKit
    error(500, 'Internal Server Error')
  }
}
