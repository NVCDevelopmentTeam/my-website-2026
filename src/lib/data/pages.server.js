// Import all markdown pages
const modules = import.meta.glob('/src/lib/contents/pages/*.md', { eager: true })

// Parse pages from markdown files
export const pages = Object.entries(modules).map(([filepath, module]) => {
  const slug = filepath.split('/').pop().replace('.md', '')
  const metadata = module.metadata ?? {}

  // Generate preview from description or content
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
      description: preview
    },
    // Add priority for sitemap
    priority: metadata.priority ?? 0.7
  }
})

/**
 * Get all pages with optional limit
 * Returns format compatible with sitemap: { pages: [...] }
 */
export function getAllPages({ limit = -1 } = {}) {
  const sortedPages = [...pages].sort((a, b) => a.metadata.title.localeCompare(b.metadata.title))

  const limitedPages = limit > 0 ? sortedPages.slice(0, limit) : sortedPages

  // Return in object format for consistency with posts
  return {
    pages: limitedPages,
    total: pages.length
  }
}

/**
 * Get single page by slug
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
