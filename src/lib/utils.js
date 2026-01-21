// src/lib/utils.js
import { siteConfig } from '$lib/config.js'

/**
 * Fetches and processes all blog posts.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of post objects.
 */
export async function fetchPosts() {
  // Using Vite's glob import to get all markdown files
  const modules = import.meta.glob('/content/posts/**/*.md')

  const postPromises = Object.entries(modules).map(async ([path, resolver]) => {
    const { metadata } = await resolver()
    const slug = path.replace('/content/posts/', '').replace('.md', '')

    return {
      slug,
      ...metadata,
      // Ensure date is a string for consistent serialization
      date: metadata.date ? new Date(metadata.date).toISOString() : new Date().toISOString()
    }
  })

  let posts = await Promise.all(postPromises)

  // Sort posts by date in descending order
  posts.sort((a, b) => new Date(b.date) - new Date(a.date))

  return posts
}

/**
 * Formats a date string into a more readable format.
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date.
 */
export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(siteConfig.language || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
