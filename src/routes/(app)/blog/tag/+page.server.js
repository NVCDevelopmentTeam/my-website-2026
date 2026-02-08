import { getAllTags } from '$lib/data/posts'
import { error } from '@sveltejs/kit'

export const prerender = true

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  try {
    const tags = getAllTags()

    return {
      tags,
      totalTags: tags.length
    }
  } catch (err) {
    console.error('Error loading tags:', err)
    error(500, 'Không thể tải danh sách thẻ.')
  }
}
