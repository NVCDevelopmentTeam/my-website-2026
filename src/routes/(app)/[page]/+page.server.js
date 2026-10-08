import { getPageBySlug, getAllPages } from '#lib/data/pages.js'
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
    const { metadata, filename } = await getPageBySlug(slug)
    // only return metadata (+ the real file name), not the content component
    return { page: { slug, filename, metadata } }
  } catch {
    error(404, `Page not found: ${slug}`)
  }
}
