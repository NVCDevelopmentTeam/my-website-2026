/**
 * Likes and reads of a post. The numbers live on the site's own Netlify function (see
 * netlify/lib/engagement.mjs), counted per visitor (IP address); this file only talks to it.
 * Every call returns null when the function cannot be reached (for example under `pnpm dev`),
 * and the page then simply shows no numbers.
 */
const API = '/api/engagement'

/**
 * @param {string} slug
 * @returns {Promise<{ likes: number, views: number } | null>}
 */
export async function fetchEngagement(slug) {
  try {
    const response = await fetch(`${API}?slug=${encodeURIComponent(slug)}`)
    return response.ok ? await response.json() : null
  } catch {
    return null
  }
}

/**
 * The shared copy of the counts can be a few minutes old; what this visitor has already done is
 * never missing from it (counts only grow).
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
 * Records a "like" or a "view" for this visitor. `created` is false when the server had already
 * counted the visitor, whatever this browser remembers.
 * @param {string} slug
 * @param {'like' | 'view'} action
 * @returns {Promise<{ created: boolean, count: number } | null>}
 */
export async function sendEngagement(slug, action) {
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
 */
export function markEngaged(action, slug) {
  try {
    localStorage.setItem(`engaged:${action}:${slug}`, '1')
  } catch {
    // Storage blocked (private mode): the server still counts each visitor once
  }
}
