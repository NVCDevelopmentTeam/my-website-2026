import { loadMarkdownPage } from '$lib/utils/loadMarkdownPage'

export async function load({ data }) {
  const pageData = await loadMarkdownPage('index')

  return {
    ...data,
    ...pageData
  }
}
