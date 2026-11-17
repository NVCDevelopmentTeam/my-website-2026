import { building } from '$app/env'

/**
 * Number of the page of a list that an address asks for (/blog?page=2). While the site is built
 * only the first page exists, so the address is not read then.
 * @param {URL} url
 * @returns {number}
 */
export function pageFromUrl(url) {
  const page = parseInt((building ? null : url.searchParams.get('page')) || '1')
  return Number.isNaN(page) || page < 1 ? 1 : page
}
