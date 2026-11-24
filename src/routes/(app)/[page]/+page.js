import { loadMarkdownPage } from '#lib/utils/loadMarkdownPage.js'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageLoad} */
export async function load({ params, parent }) {
  const { allPages } = await parent()
  const pageEntry = allPages?.find((item) => item.slug === params.page)

  if (!pageEntry) {
    error(404, `Page not found: ${params.page}`)
  }

  try {
    // Load by filename since the frontmatter `slug` may differ from the file name on disk
    return await loadMarkdownPage(pageEntry.filename)
  } catch (err) {
    console.error(`Failed to load markdown page for slug "${params.page}":`, err)
    error(404, `Page content not found: ${params.page}`)
  }
}
