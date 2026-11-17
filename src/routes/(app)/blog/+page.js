import { error } from '@sveltejs/kit'
import { pageFromUrl } from '#lib/utils/pagination.js'

/** @type {import('./$types').PageLoad} */
export async function load({ url, fetch }) {
  const response = await fetch(`/lists/blog/${pageFromUrl(url)}.json`)
  if (!response.ok) error(response.status, 'Không thể tải danh sách bài viết.')
  return await response.json()
}
