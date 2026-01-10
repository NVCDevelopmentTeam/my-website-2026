import { getAllPages } from '$lib/data/pages.server'
import { getFilteredPosts } from '$lib/data/posts.server'
import { siteConfig } from '$lib/config'

export const prerender = true

/**
 * Generate sitemap.xml for SEO
 * Includes: static pages, blog posts
 */
export async function GET({ setHeaders }) {
  setHeaders({
    'Cache-Control': 'max-age=0, s-maxage=3600', // Cache for 1 hour
    'Content-Type': 'application/xml; charset=utf-8'
  })

  try {
    // Fetch all content
    const { pages = [] } = (await getAllPages({ limit: -1 })) || {}
    const { posts = [] } = (await getFilteredPosts({ limit: -1 })) || {}

    // Homepage entry
    const homepage = `
  <url>
    <loc>${siteConfig.siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`

    // Static pages
    const pagesXml = pages
      .map(
        (page) => `
  <url>
    <loc>${siteConfig.siteUrl}/${page.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>${page.priority || 0.7}</priority>
  </url>`
      )
      .join('')

    // Blog posts
    const postsXml = posts
      .map((post) => {
        const lastmod = post.metadata?.date
          ? new Date(post.metadata.date).toISOString()
          : new Date().toISOString()

        return `
  <url>
    <loc>${siteConfig.siteUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
      })
      .join('')

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${homepage}${pagesXml}${postsXml}
</urlset>`

    return new Response(xml.trim())
  } catch (error) {
    console.error('Sitemap generation error:', error)

    // Return minimal sitemap on error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteConfig.siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

    return new Response(fallbackXml.trim())
  }
}
