// src/routes/rss.xml/+server.js
import { fetchPosts } from '$lib/utils.js'
import { siteConfig } from '$lib/config.js'

export const prerender = true

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }) {
  const posts = await fetchPosts()

  setHeaders({
    'Content-Type': 'application/rss+xml',
    'Cache-Control': 'max-age=0, s-maxage=3600' // 1 hour cache
  })

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>${siteConfig.title}</title>
        <link>${siteConfig.siteUrl}</link>
        <description>${siteConfig.description}</description>
        <atom:link href="${siteConfig.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
        <language>${siteConfig.language}</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${posts
          .map(
            (post) => `
              <item>
                <title>${post.title}</title>
                <link>${siteConfig.siteUrl}/blog/${post.slug}</link>
                <guid isPermaLink="true">${siteConfig.siteUrl}/blog/${post.slug}</guid>
                <description>${post.description}</description>
                <pubDate>${new Date(post.date).toUTCString()}</pubDate>
              </item>
            `
          )
          .join('')}
      </channel>
    </rss>`

  return new Response(rss.trim())
}
