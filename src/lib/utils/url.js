/** The home page. Every link to it (logo, menu, breadcrumbs, footer) uses this one value. */
export const HOME_HREF = '/'

/**
 * Address of a content page from its slug; the home page (slug "index") lives at "/".
 * @param {string} slug
 */
export const pageHref = (slug) => (slug === 'index' || slug === '' ? HOME_HREF : `/${slug}`)
