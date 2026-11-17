import { getStore } from '@netlify/blobs'
import { createEngagementApi, secretReader, slugReader } from '../lib/engagement.mjs'

/** @type {ReturnType<typeof createEngagementApi> | undefined} */
let api

/** @param {Request} req @param {{ ip?: string }} context */
export default async (req, context) => {
  const store = getStore('engagement')
  api ??= createEngagementApi({
    store,
    getSlugs: slugReader(new URL(req.url).origin),
    // Nothing to set up: the secret is generated and kept in the store (ENGAGEMENT_SECRET optional)
    getSecret: secretReader(store, process.env.ENGAGEMENT_SECRET)
  })

  try {
    return await api(req, context.ip)
  } catch (error) {
    console.error('engagement:', error)
    return Response.json({ error: 'Unavailable' }, { status: 503 })
  }
}

export const config = { path: '/api/engagement' }
