import { loadMarkdownPage } from '$lib/utils/loadMarkdownPage'

export async function load() {
  return await loadMarkdownPage('index')
}
