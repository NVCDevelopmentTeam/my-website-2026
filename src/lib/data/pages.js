// Import all markdown files from the specific directory
// 'eager: true' ensures the data is loaded immediately for Server Side Rendering
// Optimization: Load only metadata for listing pages
const modules = import.meta.glob('/src/lib/contents/pages/*.md', {
  eager: true,
  import: 'metadata'
})
// Separate glob for full content loading (lazy loaded when needed via dynamic import would be ideal, but for static site generation eager is fine, or we keep it this way for getPageBySlug)
// Actually, for getPageBySlug with dynamic imports in the load function, we might not need this here if we change getPageBySlug to dynamic import.
// But sticking to the current pattern:
const contentModules = import.meta.glob('/src/lib/contents/pages/*.md', { eager: true })

/**
 * Global constant 'pages': Parsed list of all markdown pages.
 * This array is generated once when the server starts.
 */
export const pages = Object.entries(modules).map(([filepath, metadata]) => {
  // Extract default slug from filename
  const filename = filepath.split('/').pop().replace('.md', '')

  // Priority: 1. metadata.slug (custom) 2. filename (default)
  const slug = metadata.slug || filename

  // Generate a brief preview for SEO description or UI cards
  const preview = metadata.description || '...'

  return {
    slug,
    filename,
    metadata: {
      title: metadata.title ?? slug,
      description: metadata.description ?? preview,
      // Support for Hugo-style menu assignment in Frontmatter
      menu: metadata.menu || ''
    },
    // Priority used for XML sitemaps and SEO
    priority: metadata.priority ?? 0.7
  }
})

/**
 * getAllPages: Fetches pages with optional filtering and sorting.
 * * IMPORTANT: We use the Spread operator [...] to create shallow copies
 * before sorting. This prevents "Hydration Mismatch" errors in SvelteKit
 * by ensuring the global 'pages' array remains in its original order.
 * * @param {Object} [options]
 * @param {number} [options.limit] - Max number of items to return (-1 for all)
 * @param {string} [options.menu] - Filter by menu location key (e.g., 'nav')
 */
export function getAllPages(options = {}) {
  const { limit = -1, menu = '' } = options
  // 1. Create a working copy of the global pages array
  let resultPages = [...pages]

  // 2. Filter by menu location if requested
  if (menu) {
    resultPages = resultPages.filter((page) => page.metadata.menu === menu)
  }

  // 3. SORTING: Crucial step. We clone 'resultPages' before calling .sort()
  // because .sort() modifies the array in place, which can break Hydration.
  const sortedPages = [...resultPages].sort((a, b) =>
    a.metadata.title.localeCompare(b.metadata.title)
  )

  // 4. Apply result limit
  const limitedPages = limit > 0 ? sortedPages.slice(0, limit) : sortedPages

  return {
    pages: limitedPages,
    total: pages.length
  }
}

/**
 * getPageBySlug: Retrieves a specific page's metadata and content.
 * @param {string} slug - The filename/slug of the markdown file.
 */
export function getPageBySlug(slug) {
  const match = Object.entries(contentModules).find(([path, module]) => {
    const filename = path.split('/').pop().replace('.md', '')
    return module.metadata?.slug === slug || filename === slug
  })
  if (!match) throw new Error(`Page not found: ${slug}`)

  const [, module] = match
  return {
    metadata: module.metadata ?? {},
    content: module.default
  }
}
