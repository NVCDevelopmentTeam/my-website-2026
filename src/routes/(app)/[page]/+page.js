import { loadMarkdownPage } from '$lib/utils/loadMarkdownPage'

export async function load({ params }) {
  const slug = params.page
  return await loadMarkdownPage(slug)
}
