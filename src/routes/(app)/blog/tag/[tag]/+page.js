import { error } from '@sveltejs/kit'
import { pageFromUrl } from '#lib/utils/pagination.js'

/** @type {import('./$types').PageLoad} */
export async function load({ params, url, fetch }) {
  const response = await fetch(`/lists/tag/${params.tag}/${pageFromUrl(url)}.json`)
  if (!response.ok) error(response.status, 'Không tìm thấy thẻ hoặc trang này.')
  return await response.json()
}
