export const prerender = true
// 'never' → /about, /blog/my-post (files: about.html …). This matches every URL the code
// emits (sitemap, RSS, canonical, JSON-LD, breadcrumbs, internal links, aria-current checks)
// and is served natively by Netlify's default Pretty URLs (/about.html ⇄ /about, /about/ → /about).
export const trailingSlash = 'never'
