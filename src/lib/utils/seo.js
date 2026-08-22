import { siteConfig } from '$lib/config'

/**
 * Default SEO configuration for the site
 */
export const defaultSeoConfig = {
  title: siteConfig.title,
  description: siteConfig.description,
  canonical: siteConfig.siteUrl,
  openGraph: {
    type: 'website',
    url: siteConfig.siteUrl,
    title: siteConfig.title,
    description: siteConfig.description,
    site_name: siteConfig.title,
    images: [
      {
        url: siteConfig.siteUrl + '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: siteConfig.title
      }
    ]
  },
  twitter: {
    cardType: 'summary_large_image',
    site: siteConfig.social.github,
    handle: siteConfig.social.github,
    title: siteConfig.title,
    description: siteConfig.description,
    image: siteConfig.siteUrl + '/og-image.jpg'
  }
}

/**
 * Build SEO configuration for a specific page
 * @param {Object} params
 * @param {string} params.title
 * @param {string} [params.description]
 * @param {string} params.url
 * @param {string} [params.image]
 * @param {string} [params.type] - OpenGraph type: 'website' | 'article'
 * @param {Object} [params.article] - Article metadata (publishedTime, modifiedTime, author, tags)
 */
export function getSeoConfig({ title, description, url, image, type = 'website', article = null }) {
  var fullTitle = title + ' — ' + siteConfig.title
  var fullUrl = siteConfig.siteUrl + url
  var seoDescription = description || siteConfig.description
  var seoImage = image ? siteConfig.siteUrl + image : siteConfig.siteUrl + '/og-image.jpg'

  var ogData = {
    ...defaultSeoConfig.openGraph,
    type,
    title: fullTitle,
    description: seoDescription,
    url: fullUrl,
    images: [{ url: seoImage, alt: title }]
  }

  // Add article-specific OpenGraph properties
  if (type === 'article' && article) {
    ogData.article = {
      publishedTime: article.publishedTime,
      modifiedTime: article.modifiedTime,
      authors: article.author ? [article.author] : [],
      tags: article.tags || []
    }
  }

  return {
    ...defaultSeoConfig,
    title: fullTitle,
    description: seoDescription,
    canonical: fullUrl,
    openGraph: ogData,
    twitter: {
      ...defaultSeoConfig.twitter,
      title: fullTitle,
      description: seoDescription,
      image: seoImage
    }
  }
}

/**
 * Safely serialize JSON-LD schema for injection into HTML.
 * Escapes </script> to prevent XSS.
 * @param {Object} schema
 * @returns {string|null}
 */
export function serializeSchema(schema) {
  if (!schema) return null
  return (
    '<script type="application/ld+json">' +
    JSON.stringify(schema).replace(/<\/script>/g, '<\\/script>') +
    '</script>'
  )
}
