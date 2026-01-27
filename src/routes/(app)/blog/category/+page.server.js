import { getAllCategories } from '$lib/data/posts.server'
import { error } from '@sveltejs/kit'

export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  try {
    const uniqueCategories = getAllCategories()

    return {
      uniqueCategories,
      totalCategories: uniqueCategories.length
    }
  } catch (err) {
    console.error('Error loading categories:', err)
    error(500, 'Không thể tải danh sách danh mục.')
  }
}
