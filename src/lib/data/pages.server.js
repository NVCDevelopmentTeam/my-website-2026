// Import all markdown files from the specific directory
// 'eager: true' ensures the data is loaded immediately for Server Side Rendering
const modules = import.meta.glob('/src/lib/contents/pages/*.md', { eager: true })

/**
 * Global constant 'pages': Parsed list of all markdown pages.
 * This array is generated once when the server starts.
 */
export const pages = Object.entries(modules).map(([filepath, module]) => {
  // Extract slug from filename (e.g., /path/to/about.md -> about)
  const slug = filepath.split('/').pop().replace('.md', '')
  const metadata = module.metadata ?? {}

  // Generate a brief preview for SEO description or UI cards
  const preview =
    metadata.description ||
    (module.default
      ?.toString()
      ?.slice(0, 150)
      .replace(/<[^>]+>/g, '') ?? '') + '…'

  return {
    slug,
    metadata: {
      title: metadata.title ?? slug,
      description: preview,
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
 * * @param {Object} options
 * @param {number} options.limit - Max number of items to return (-1 for all)
 * @param {string} options.menu - Filter by menu location key (e.g., 'nav')
 */
export function getAllPages({ limit = -1, menu = '' } = {}) {
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
  const match = Object.entries(modules).find(([path]) => path.endsWith(`${slug}.md`))
  if (!match) throw new Error(`Page not found: ${slug}`)

  const [, module] = match
  return {
    metadata: module.metadata ?? {},
    content: module.default
  }
}
