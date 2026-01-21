// src/routes/sitemap.xml/+server.js
import { fetchPosts } from '$lib/utils.js'
import { siteConfig } from '$lib/config.js'

export const prerender = true

/** @type {import('./$types').RequestHandler} */
export async function GET({ setHeaders }) {
  const posts = await fetchPosts()

  setHeaders({
    'Content-Type': 'application/xml',
    'Cache-Control': 'max-age=0, s-maxage=3600' // 1 hour cache
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
    <urlset
      xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xhtml="https://www.w3.org/1999/xhtml"
      xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
      xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
      xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
    >
      <url>
        <loc>${siteConfig.siteUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      <url>
        <loc>${siteConfig.siteUrl}/blog</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      ${posts
        .map(
          (post) => `
            <url>
              <loc>${siteConfig.siteUrl}/blog/${post.slug}</loc>
              <changefreq>weekly</changefreq>
              <lastmod>${new Date(post.date).toISOString()}</lastmod>
              <priority>0.5</priority>
            </url>
          `
        )
        .join('')}
    </urlset>`

  return new Response(sitemap.trim())
}
