import { loadMarkdownPage } from '#lib/utils/loadMarkdownPage.js'
import { error } from '@sveltejs/kit'

export async function load({ parent }) {
  try {
    // The latest posts are already in the layout data; no separate request for the home page
    const [{ recentPosts }, pageData] = await Promise.all([parent(), loadMarkdownPage('index')])
    return { latestPosts: recentPosts.slice(0, 3), ...pageData }
  } catch (err) {
    console.error('Error loading homepage content:', err)
    error(500, 'Không thể tải nội dung trang chủ.')
  }
}
