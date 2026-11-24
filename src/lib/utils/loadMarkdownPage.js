/**
 * Dynamically load a compiled markdown page module by slug.
 * @param {string} [slug='index'] - Target page filename without the `.md` extension.
 */
export async function loadMarkdownPage(slug = 'index') {
  // Use a root-relative glob path so Vite reliably discovers all markdown pages
  const modules = import.meta.glob('/src/lib/contents/pages/*.md')

  // Normalize Windows/POSIX separators before matching the target markdown file
  const match = Object.entries(modules).find(([path]) =>
    path.replace(/\\/g, '/').endsWith(`/${slug}.md`)
  )

  if (!match) {
    throw new Error(`Page not found: ${slug}`)
  }

  const [, resolver] = match
  const mod = /** @type {{ default: any, metadata?: Record<string, any> }} */ (await resolver())

  // Guard against missing frontmatter so callers never read properties from undefined
  const metadata = mod?.metadata ?? {}

  return {
    content: mod?.default ?? null,
    metadata
  }
}
