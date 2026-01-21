// src/routes/blog/[slug]/+page.server.js
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  try {
    // Dynamically import the markdown file
    const post = await import(`../../../../content/posts/${params.slug}.md`)

    // The 'default' export from the markdown file is the rendered component
    const content = post.default

    // The 'metadata' export contains the frontmatter
    const metadata = post.metadata

    return {
      content,
      ...metadata
    }
    // @ts-ignore
  } catch (e) {
    // If the post is not found, throw a 404 error
    throw error(404, 'Post not found')
  }
}
