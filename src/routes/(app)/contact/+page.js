import { loadMarkdownPage } from '$lib/utils/loadMarkdownPage'
import { error } from '@sveltejs/kit'

export async function load() {
  try {
    return await loadMarkdownPage('contact')
  } catch (err) {
    console.error('Error loading contact page content:', err)
    error(500, 'Không thể tải nội dung trang liên hệ.')
  }
}
