import { getAllCategories } from '#lib/data/posts.js'

export const prerender = true

// Build time only: which categories get a page. The page itself reads /lists/category/...
export function entries() {
  return getAllCategories()
    .filter((c) => c?.metadata)
    .map((c) => ({ category: c.metadata.slug }))
}
