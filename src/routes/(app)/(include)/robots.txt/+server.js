import { siteConfig } from '$lib/config'

export const prerender = true
export const trailingSlash = 'never'

export async function GET() {
  const robots = `
User-agent: *
Disallow:

Sitemap: ${siteConfig.siteUrl}/sitemap.xml
`.trim()

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}
