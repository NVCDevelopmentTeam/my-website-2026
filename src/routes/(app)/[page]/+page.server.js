import { getAllPages } from '#lib/data/pages.js'

export const prerender = true

// Build time only: which pages to generate. Everything else about a page comes from the layout
// data the browser already has, so opening a page needs no extra data request.
export function entries() {
  const { pages } = getAllPages()
  // 'index' is the home page, handled by the root route
  return pages.filter((p) => p.slug !== 'index').map((p) => ({ page: p.slug }))
}
