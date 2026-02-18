// @ts-nocheck
import { getAllCategories } from '$lib/data/posts'
import { error } from '@sveltejs/kit'

export const prerender = true

/** */
export async function load() {
  try {
    const categories = getAllCategories()

    // Flatten metadata for easier use in template
    const uniqueCategories = categories.map((c) => ({
      title: c.metadata.title,
      slug: c.metadata.slug,
      count: c.metadata.count
    }))

    // Sort alphabetically by title
    uniqueCategories.sort((a, b) => a.title.localeCompare(b.title, 'vi'))

    return {
      uniqueCategories,
      totalCategories: uniqueCategories.length
    }
  } catch (err) {
    console.error('Error loading categories:', err)
    error(500, 'Không thể tải danh sách danh mục.')
  }
}
