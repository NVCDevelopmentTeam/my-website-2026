import { loadMarkdownPage } from '$lib/utils/loadMarkdownPage'
import { error } from '@sveltejs/kit'

export async function load({ params }) {
  const slug = params.page
  try {
    return await loadMarkdownPage(slug)
  } catch (err) {
    console.error(`Error loading page content for "${slug}":`, err)
    error(404, `Page content not found: ${slug}`)
  }
}
