import { getAllPages } from '#lib/data/pages.js'

export const prerender = true

// Build-time route entries used for static prerendering; runtime data comes from layout/page load
export function entries() {
  const { pages } = getAllPages()

  // Exclude 'index' because the root route handles the home page
  return pages.filter((page) => page.slug !== 'index').map((page) => ({ page: page.slug }))
}
