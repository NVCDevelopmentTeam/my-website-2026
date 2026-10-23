/**
 * Likes and reads of the blog posts, kept on the site's own Netlify (Functions + Blobs): no third
 * party. Both are counted per visitor, where a visitor is an IP address:
 *
 *   - one like per visitor and post, one read per visitor and post (the first visit only);
 *   - a post is the centre of the data: only slugs of posts that exist right now are accepted,
 *     and the data of posts that were deleted is removed (see removeOrphans);
 *   - nothing personal is stored: the key of an entry is an HMAC of the IP with a secret, so the
 *     address cannot be read back from it.
 *
 * Each entry is its own blob: `<action>/<slug>/<visitor>`. Counting is listing, writing a second
 * time is a no-op (`onlyIfNew`), so there are no counters to race on.
 */

const ACTIONS = ['like', 'view']

/**
 * @param {unknown} body
 * @param {number} [status]
 * @param {Record<string, string>} [headers]
 */
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  })

/**
 * Anonymous, stable id of a visitor: the first 16 bytes of HMAC-SHA256(secret, ip).
 * @param {string} ip
 * @param {string} secret
 */
async function visitorId(ip, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip))
  return Array.from(new Uint8Array(signature).slice(0, 16), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')
}

/**
 * @param {{
 *   store: { list: Function, set: Function, delete: Function },
 *   getSlugs: () => Promise<Set<string>>,
 *   secret: string
 * }} deps
 */
export function createEngagementApi({ store, getSlugs, secret }) {
  /** @param {string} action @param {string} slug */
  async function countOf(action, slug) {
    let count = 0
    for await (const { blobs } of store.list({ prefix: `${action}/${slug}/`, paginate: true })) {
      count += blobs.length
    }
    return count
  }

  /**
   * @param {Request} req
   * @param {string} [ip]
   */
  return async function handle(req, ip = 'unknown') {
    const url = new URL(req.url)

    if (req.method === 'GET') {
      const slug = url.searchParams.get('slug') ?? ''
      if (!(await getSlugs()).has(slug)) return json({ error: 'Unknown post' }, 404)

      const [likes, views] = await Promise.all([countOf('like', slug), countOf('view', slug)])
      return json(
        { likes, views },
        200,
        // Shared counts: Netlify's CDN keeps one copy for a few minutes, so a busy post does not
        // run this function (and read the store) on every page view. Browsers always ask the CDN,
        // never keep their own copy, so a visitor's own like or read is not hidden by an old one.
        {
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'Netlify-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
        }
      )
    }

    if (req.method === 'POST') {
      // Only the site itself may count (a request from another site is refused)
      const origin = req.headers.get('origin')
      if (origin && origin !== url.origin) return json({ error: 'Forbidden' }, 403)

      /** @type {{ slug?: unknown, action?: unknown }} */
      const body = await req.json().catch(() => ({}))
      const { slug, action } = body
      if (typeof slug !== 'string' || typeof action !== 'string') {
        return json({ error: 'Bad request' }, 400)
      }
      if (!ACTIONS.includes(action)) return json({ error: 'Unknown action' }, 400)
      if (!(await getSlugs()).has(slug)) return json({ error: 'Unknown post' }, 404)

      const key = `${action}/${slug}/${await visitorId(ip, secret)}`
      const { modified } = await store.set(key, '1', { onlyIfNew: true })
      return json({ created: modified, count: await countOf(action, slug) })
    }

    return json({ error: 'Method not allowed' }, 405, { Allow: 'GET, POST' })
  }
}

/**
 * Deletes the entries of posts that no longer exist. Refuses to run with an empty list of posts,
 * so a broken slug list can never wipe the store.
 * @param {{ list: Function, delete: Function }} store
 * @param {Set<string>} slugs
 * @returns {Promise<number>} how many entries were removed
 */
export async function removeOrphans(store, slugs) {
  if (slugs.size === 0) return 0

  let removed = 0
  for (const action of ACTIONS) {
    for await (const { blobs } of store.list({ prefix: `${action}/`, paginate: true })) {
      for (const { key } of blobs) {
        if (!slugs.has(key.split('/')[1])) {
          await store.delete(key)
          removed += 1
        }
      }
    }
  }
  return removed
}

/**
 * The slugs of the posts that exist, read from the site's own /post-slugs.json (built together
 * with the site) and remembered for ten minutes.
 * @param {string} origin
 */
export function slugReader(origin) {
  /** @type {{ slugs: Set<string>, at: number } | undefined} */
  let cached
  return async () => {
    if (!cached || Date.now() - cached.at > 10 * 60 * 1000) {
      const response = await fetch(new URL('/post-slugs.json', origin))
      if (!response.ok) throw new Error(`post-slugs.json: ${response.status}`)
      cached = { slugs: new Set(await response.json()), at: Date.now() }
    }
    return cached.slugs
  }
}
