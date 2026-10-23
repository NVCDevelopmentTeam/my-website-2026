import { getStore } from '@netlify/blobs'
import { removeOrphans } from '../lib/engagement.mjs'

// Once a week: the likes and reads of posts that were deleted from the site are deleted as well.
export default async () => {
  const origin = process.env.URL
  if (!origin) return console.warn('engagement-cleanup: site URL is not available, nothing done')

  const response = await fetch(new URL('/post-slugs.json', origin))
  if (!response.ok) return console.warn(`engagement-cleanup: post-slugs.json ${response.status}`)

  const removed = await removeOrphans(getStore('engagement'), new Set(await response.json()))
  console.log(`engagement-cleanup: ${removed} entries of deleted posts removed`)
}

export const config = { schedule: '@weekly' }
