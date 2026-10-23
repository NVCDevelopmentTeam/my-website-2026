import { loadMarkdownPage } from '#lib/utils/loadMarkdownPage.js'
import { error } from '@sveltejs/kit'

export async function load({ params, parent }) {
  // The page list (with each page's file name) is part of the layout data
  const { allPages } = await parent()
  const entry = allPages.find((p) => p.slug === params.page)
  if (!entry) error(404, `Page not found: ${params.page}`)

  try {
    // A page's `slug` frontmatter may differ from its file name — import by file name
    return await loadMarkdownPage(entry.filename)
  } catch (err) {
    console.error(`Error loading page content for "${params.page}":`, err)
    error(404, `Page content not found: ${params.page}`)
  }
}
