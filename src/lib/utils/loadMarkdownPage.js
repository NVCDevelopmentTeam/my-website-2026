export async function loadMarkdownPage(slug = 'index') {
  const modules = import.meta.glob('$lib/contents/pages/*.md')
  const pages = {}

  for (const [path, resolver] of Object.entries(modules)) {
    const name = path.split('/').pop().replace('.md', '')
    const mod = /** @type {{ default: any, metadata: any }} */ (await resolver())
    pages[name] = {
      content: mod.default,
      metadata: mod.metadata
    }
  }

  const page = pages[slug]
  if (!page) {
    throw new Error(`Page not found ${slug}`)
  }

  return {
    content: page.content,
    metadata: page.metadata,
    allPages: pages
  }
}
