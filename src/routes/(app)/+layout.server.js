import { getAllPages } from '#lib/data/pages.js'
import { getFilteredPosts, getAllCategories, getAllTags } from '#lib/data/posts.js'
import { error } from '@sveltejs/kit'

export const prerender = true

// This data is sent to the browser with every page, so it carries only what the menus, the footer,
// the breadcrumbs, the sidebar and the home page cards show: not the table of contents, the word
// count or the long descriptions of every post and page.

/** @param {any} page */
const toNavItem = ({ slug, filename, metadata }) => ({
  slug,
  filename,
  metadata: { title: metadata.title, menu: metadata.menu }
})

/** @param {any} post */
const toCard = ({ slug, metadata: m }) => ({
  slug,
  metadata: {
    slug: m.slug,
    title: m.title,
    author: m.author,
    date: m.date,
    categories: m.categories,
    tags: m.tags,
    description: m.description,
    preview: m.preview,
    readingTime: m.readingTime,
    image: m.image
  }
})

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
  try {
    var { pages: allPages } = getAllPages()
    var { pages: navPages } = getAllPages({ menu: 'nav' })
    var { posts: recentPosts } = getFilteredPosts({ offset: 0, limit: 5 })
    var allCategories = getAllCategories()
    var allTags = getAllTags()

    return {
      allPages: allPages.map(toNavItem),
      navPages: navPages.map(toNavItem),
      recentPosts: recentPosts.map(toCard),
      allCategories,
      allTags
    }
  } catch (err) {
    console.error('Error loading layout data:', err)
    error(500, 'Internal Server Error')
  }
}
