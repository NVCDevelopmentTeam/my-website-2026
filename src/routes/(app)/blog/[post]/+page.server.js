import { getPostBySlug } from '$lib/data/posts.server'
import { error } from '@sveltejs/kit'

export const prerender = false

export async function load({ params }) {
  const slugOrRaw = params.post

  try {
    const entry = getPostBySlug(slugOrRaw)
    const { metadata, rawName, slug } = entry

    // Do not redirect, use param directly — slug or rawName
    return {
      post: {
        slug,
        rawName,
        metadata
      }
    }
  } catch {
    error(404, `Post not found: ${slugOrRaw}`)
  }
}
