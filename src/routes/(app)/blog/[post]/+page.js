import { error } from '@sveltejs/kit'

export async function load({ data }) {
  const { slug, rawName, metadata } = data.post

  // Use slug (metadata.slug) if defined, else use rawName
  const fileToImport = slug ?? rawName

  try {
    const postModule = await import(`$lib/contents/posts/${fileToImport}.md`)

    return {
      content: postModule.default,
      metadata,
      layout: {
        fullWidth: true
      }
    }
  } catch (err) {
    console.error(`Error loading post content for "${fileToImport}":`, err)
    error(404, `Post content not found: ${fileToImport}`)
  }
}
