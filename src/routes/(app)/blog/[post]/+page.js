export async function load({ data }) {
  const { slug, rawName, metadata } = data.post

  // Use slug (metadata.slug) if defined, else use rawName
  const fileToImport = slug ?? rawName

  const postModule = await import(`$lib/contents/posts/${fileToImport}.md`)

  return {
    content: postModule.default,
    metadata,
    layout: {
      fullWidth: true
    }
  }
}
