import { slugify } from '#lib/utils/slugify.js'
import { readDocument } from '#lib/utils/document.js'

// Metadata only (`?data` parses a page without rendering it): used by menus and listings
const modules = /** @type {Record<string, any>} */ (
  import.meta.glob('/src/lib/contents/pages/*.md', { query: '?data', eager: true })
)

/**
 * Parsed list of all markdown pages, generated once at startup.
 */
export const pages = Object.entries(modules).map(function ([filepath, mod]) {
  const safeMetadata = readDocument(mod)
  const filename = (filepath.split('/').pop() ?? '').replace('.md', '')
  // `slug` may be typed by hand in the CMS (spaces, diacritics, upper case) -> normalise
  const slug = slugify(safeMetadata.slug) || slugify(filename) || filename
  const preview = safeMetadata.description || '...'

  return {
    slug,
    filename,
    metadata: {
      title: safeMetadata.title ?? slug,
      description: safeMetadata.description ?? preview,
      menu: safeMetadata.menu || ''
    },
    priority: safeMetadata.priority ?? 0.7
  }
})

/**
 * Get pages with optional filtering and sorting.
 * Uses spread copies to prevent hydration mismatch.
 * @param {Object} [options]
 * @param {number} [options.limit] - Max items (-1 for all)
 * @param {string} [options.menu] - Filter by menu location
 */
export function getAllPages(options = {}) {
  const { limit = -1, menu = '' } = options
  let resultPages = [...pages]

  if (menu) {
    resultPages = resultPages.filter(function (page) {
      return page.metadata.menu === menu
    })
  }

  const sortedPages = [...resultPages].sort(function (a, b) {
    return a.metadata.title.localeCompare(b.metadata.title)
  })

  const limitedPages = limit > 0 ? sortedPages.slice(0, limit) : sortedPages

  return {
    pages: limitedPages,
    total: pages.length
  }
}
