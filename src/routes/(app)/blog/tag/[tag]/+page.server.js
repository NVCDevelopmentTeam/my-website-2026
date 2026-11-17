import { getAllTags } from '#lib/data/posts.js'

export const prerender = true

// Build time only: which tags get a page. The page itself reads /lists/tag/...
export function entries() {
  return getAllTags().map((t) => ({ tag: t.slug }))
}
