import { getPageBySlug, getAllPages } from '$lib/data/pages.server'
import { error } from '@sveltejs/kit'

export const prerender = true

export async function entries() {
  const { pages } = getAllPages()
  // Exclude 'index' as it's handled by the root route
  return pages.filter((p) => p.slug !== 'index').map((p) => ({ page: p.slug }))
}

export async function load({ params }) {
  const { page: slug } = params
  try {
    const { metadata } = await getPageBySlug(slug)
    // only return metadata, not content component
    return { page: { slug, metadata } }
  } catch {
    error(404, `Page not found: ${slug}`)
  }
}
