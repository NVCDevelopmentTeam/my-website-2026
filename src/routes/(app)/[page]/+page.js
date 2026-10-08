import { loadMarkdownPage } from '#lib/utils/loadMarkdownPage.js'
import { error } from '@sveltejs/kit'

export async function load({ params, data }) {
  const slug = params.page
  try {
    // A page's `slug` frontmatter may differ from its file name — import by file name
    return await loadMarkdownPage(data?.page?.filename ?? slug)
  } catch (err) {
    console.error(`Error loading page content for "${slug}":`, err)
    error(404, `Page content not found: ${slug}`)
  }
}
