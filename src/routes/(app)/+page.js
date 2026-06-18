import { loadMarkdownPage } from '$lib/utils/loadMarkdownPage'
import { error } from '@sveltejs/kit'

export async function load({ data }) {
  try {
    const pageData = await loadMarkdownPage('index')

    return {
      ...data,
      ...pageData
    }
  } catch (err) {
    console.error('Error loading homepage content:', err)
    error(500, 'Không thể tải nội dung trang chủ.')
  }
}
