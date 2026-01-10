import { getPageBySlug } from '$lib/data/pages.server'
import { error } from '@sveltejs/kit'

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
