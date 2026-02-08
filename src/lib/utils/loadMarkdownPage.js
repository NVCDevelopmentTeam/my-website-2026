export async function loadMarkdownPage(slug = 'index') {
  const modules = import.meta.glob('$lib/contents/pages/*.md')

  // Find the specific module for the requested slug
  const match = Object.entries(modules).find(([path]) => path.endsWith(`${slug}.md`))

  if (!match) {
    throw new Error(`Page not found: ${slug}`)
  }

  const [, resolver] = match
  const mod = /** @type {{ default: any, metadata: any }} */ (await resolver())

  return {
    content: mod.default,
    metadata: mod.metadata
  }
}
