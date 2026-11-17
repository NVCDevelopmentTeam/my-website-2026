/**
 * Likes and reads of a post. The numbers live on the site's own Netlify function (see
 * netlify/lib/engagement.mjs), counted per visitor (IP address); this file only talks to it.
 * Every call returns null when the function cannot be reached (and always under `pnpm dev`, where
 * there is no function), and the page then simply shows no numbers.
 */
const API = '/api/engagement'

/**
 * @param {string} slug
 * @returns {Promise<{ likes: number, views: number } | null>}
 */
export async function fetchEngagement(slug) {
  if (import.meta.env.DEV) return null
  try {
    const response = await fetch(`${API}?slug=${encodeURIComponent(slug)}`)
    return response.ok ? await response.json() : null
  } catch {
    return null
  }
}

/**
 * The shared copy of the counts can be a few seconds old; what this visitor has already done is
 * never missing from it (counts only grow while this visitor's own like is in place).
 * @param {{ likes: number, views: number }} counts
 * @param {string} slug
 */
export function withOwnActions(counts, slug) {
  return {
    likes: Math.max(counts.likes, hasEngaged('like', slug) ? 1 : 0),
    views: Math.max(counts.views, hasEngaged('view', slug) ? 1 : 0)
  }
}

/**
 * Records a "like", an "unlike" or a "view" for this visitor. `changed` is false when the server
 * had nothing to change (it had counted the visitor already), whatever this browser remembers.
 * @param {string} slug
 * @param {'like' | 'unlike' | 'view'} action
 * @returns {Promise<{ changed: boolean, count: number } | null>}
 */
export async function sendEngagement(slug, action) {
  if (import.meta.env.DEV) return null
  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, action })
    })
    return response.ok ? await response.json() : null
  } catch {
    return null
  }
}

/**
 * What this browser already did, only to avoid asking the server again (the server decides).
 * @param {'like' | 'view'} action
 * @param {string} slug
 */
export function hasEngaged(action, slug) {
  try {
    return localStorage.getItem(`engaged:${action}:${slug}`) === '1'
  } catch {
    return false
  }
}

/**
 * @param {'like' | 'view'} action
 * @param {string} slug
 * @param {boolean} [on]
 */
export function setEngaged(action, slug, on = true) {
  try {
    if (on) localStorage.setItem(`engaged:${action}:${slug}`, '1')
    else localStorage.removeItem(`engaged:${action}:${slug}`)
  } catch {
    // Storage blocked (private mode): the server still counts each visitor once
  }
}
