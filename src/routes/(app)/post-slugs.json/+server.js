import { json } from '@sveltejs/kit'
import { getFilteredPosts } from '#lib/data/posts.js'

export const prerender = true

// The slugs of the posts that exist. The likes/reads API accepts only these, and its weekly
// cleanup deletes the data of every post that is not in this list any more.
export function GET() {
  const { posts } = getFilteredPosts({ limit: -1 })
  return json(posts.map((post) => post.slug))
}
