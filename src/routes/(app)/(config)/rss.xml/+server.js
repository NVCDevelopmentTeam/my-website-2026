import { getFilteredPosts } from '$lib/data/posts.server'
import { siteConfig } from '$lib/config'

export const prerender = true

/**
 * Generate RSS feed for blog posts
 * Standard: RSS 2.0 with Atom namespace
 */
export async function GET({ setHeaders }) {
  setHeaders({
    'Cache-Control': 'max-age=0, s-maxage=3600', // Cache 1 hour
    'Content-Type': 'application/xml; charset=utf-8'
  })

  try {
    // Fetch all posts
    const { posts = [] } = (await getFilteredPosts({ limit: -1 })) || {}

    // Build RSS items
    const items = posts
      .map((post) => {
        const postUrl = `${siteConfig.siteUrl}/blog/${post.slug}`
        const pubDate = post.metadata?.date
          ? new Date(post.metadata.date).toUTCString()
          : new Date().toUTCString()

        // Escape XML special characters
        const title = escapeXml(post.metadata?.title || 'Untitled')
        const description = escapeXml(
          post.metadata?.description || post.metadata?.excerpt || 'No description available'
        )
        const author = escapeXml(
          post.metadata?.author || siteConfig.author?.name || siteConfig.title
        )

        const categoriesXml = Array.isArray(post.metadata?.categories)
          ? post.metadata.categories
              .map((cat) => `<category>${escapeXml(cat)}</category>`)
              .join('\n      ')
          : ''

        return `
    <item>
      <guid isPermaLink="true">${postUrl}</guid>
      <title>${title}</title>
      <link>${postUrl}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${author}</author>
      ${categoriesXml}
    </item>`
      })
      .join('')

    // Build complete RSS feed
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${siteConfig.siteUrl}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${siteConfig.language || 'vi'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

    return new Response(xml.trim())
  } catch (error) {
    console.error('RSS generation error:', error)

    // Return minimal valid RSS on error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${siteConfig.siteUrl}</link>
    <description>${escapeXml(siteConfig.description)}</description>
  </channel>
</rss>`

    return new Response(fallbackXml.trim())
  }
}

/**
 * Escape XML special characters to prevent feed corruption
 */
function escapeXml(text) {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
