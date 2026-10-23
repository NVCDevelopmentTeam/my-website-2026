import { getStore } from '@netlify/blobs'
import { createEngagementApi, slugReader } from '../lib/engagement.mjs'

/** @type {ReturnType<typeof createEngagementApi> | undefined} */
let api

/** @param {Request} req @param {{ ip?: string, site?: { id?: string } }} context */
export default async (req, context) => {
  api ??= createEngagementApi({
    store: getStore('engagement'),
    getSlugs: slugReader(new URL(req.url).origin),
    // Works without any setup (keyed with the site id). For a key nobody else could know, set an
    // ENGAGEMENT_SECRET environment variable in Netlify; it is optional.
    secret: process.env.ENGAGEMENT_SECRET || context.site?.id || 'engagement'
  })

  try {
    return await api(req, context.ip)
  } catch (error) {
    console.error('engagement:', error)
    return Response.json({ error: 'Unavailable' }, { status: 503 })
  }
}

export const config = { path: '/api/engagement' }
