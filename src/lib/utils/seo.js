// =======================
// SEO CONFIG
// =======================

import { siteConfig } from '$lib/config'

// =======================
// DEFAULT SEO CONFIG
// =======================
export const defaultSeoConfig = {
  title: siteConfig.title,
  description: siteConfig.description,
  canonical: siteConfig.siteUrl,

  openGraph: {
    type: 'website',
    url: siteConfig.siteUrl,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: siteConfig.title
      }
    ]
  },

  twitter: {
    card: 'summary_large_image'
  }
}

/**
 * Get SEO config for a specific page/post
 * @param {Object} options 
 * @param {string} options.title 
 * @param {string} options.description 
 * @param {string} options.url 
 * @param {string} [options.image]
 */
export function getSeoConfig({ title, description, url, image }) {
  const fullTitle = `${title} — ${siteConfig.title}`
  const fullUrl = `${siteConfig.siteUrl}${url}`
  
  return {
    ...defaultSeoConfig,
    title: fullTitle,
    description: description || siteConfig.description,
    canonical: fullUrl,
    openGraph: {
      ...defaultSeoConfig.openGraph,
      title: fullTitle,
      description: description || siteConfig.description,
      url: fullUrl,
      images: image ? [{ url: `${siteConfig.siteUrl}${image}`, alt: title }] : defaultSeoConfig.openGraph.images
    }
  }
}