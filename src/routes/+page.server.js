// src/routes/+page.server.js
import { fetchPosts } from '$lib/utils.js'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  const posts = await fetchPosts()

  // Return only the most recent posts for the homepage
  const recentPosts = posts.slice(0, 5)

  return {
    posts: recentPosts
  }
}
