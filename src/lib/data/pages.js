// Load only metadata for listing pages
const modules = import.meta.glob('/src/lib/contents/pages/*.md', {
  eager: true,
  import: 'metadata'
})

// Full content modules for page rendering
const contentModules = import.meta.glob('/src/lib/contents/pages/*.md', { eager: true })

/**
 * Parsed list of all markdown pages, generated once at startup.
 */
export const pages = Object.entries(modules).map(function ([filepath, metadata]) {
  var filename = filepath.split('/').pop().replace('.md', '')
  var slug = metadata.slug || filename
  var preview = metadata.description || '...'

  return {
    slug,
    filename,
    metadata: {
      title: metadata.title ?? slug,
      description: metadata.description ?? preview,
      menu: metadata.menu || ''
    },
    priority: metadata.priority ?? 0.7
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
  var { limit = -1, menu = '' } = options
  var resultPages = [...pages]

  if (menu) {
    resultPages = resultPages.filter(function (page) {
      return page.metadata.menu === menu
    })
  }

  var sortedPages = [...resultPages].sort(function (a, b) {
    return a.metadata.title.localeCompare(b.metadata.title)
  })

  var limitedPages = limit > 0 ? sortedPages.slice(0, limit) : sortedPages

  return {
    pages: limitedPages,
    total: pages.length
  }
}

/**
 * Get a specific page's metadata and content by slug.
 * @param {string} slug
 */
export function getPageBySlug(slug) {
  var match = Object.entries(contentModules).find(function ([path, module]) {
    var filename = path.split('/').pop().replace('.md', '')
    return module.metadata?.slug === slug || filename === slug
  })
  if (!match) throw new Error('Page not found: ' + slug)

  var module = match[1]
  return {
    metadata: module.metadata ?? {},
    content: module.default
  }
}
