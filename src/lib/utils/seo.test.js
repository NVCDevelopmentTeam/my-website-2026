import { describe, it, expect } from 'vitest'
import { getSeoConfig, defaultSeoConfig, serializeSchema } from './seo.js'

describe('defaultSeoConfig', () => {
  it('has required OpenGraph fields', () => {
    expect(defaultSeoConfig.openGraph).toBeDefined()
    expect(defaultSeoConfig.openGraph.type).toBe('website')
    expect(defaultSeoConfig.openGraph.title).toBeTruthy()
    expect(defaultSeoConfig.openGraph.description).toBeTruthy()
    expect(defaultSeoConfig.openGraph.images).toBeInstanceOf(Array)
    expect(defaultSeoConfig.openGraph.images.length).toBeGreaterThan(0)
  })

  it('has required Twitter card fields', () => {
    expect(defaultSeoConfig.twitter).toBeDefined()
    expect(defaultSeoConfig.twitter.cardType).toBe('summary_large_image')
    expect(defaultSeoConfig.twitter.title).toBeTruthy()
  })

  it('has title and description from site config', () => {
    expect(defaultSeoConfig.title).toBeTruthy()
    expect(defaultSeoConfig.description).toBeTruthy()
    expect(defaultSeoConfig.canonical).toBeTruthy()
  })
})

describe('getSeoConfig', () => {
  it('generates full SEO config for a page', () => {
    const config = getSeoConfig({
      title: 'Test Page',
      description: 'Test description',
      url: '/test',
      image: '/images/test.jpg'
    })

    expect(config.title).toContain('Test Page')
    expect(config.description).toBe('Test description')
    expect(config.canonical).toContain('/test')
    expect(config.openGraph.title).toContain('Test Page')
    expect(config.openGraph.description).toBe('Test description')
    expect(config.openGraph.url).toContain('/test')
    expect(config.openGraph.images[0].url).toContain('/images/test.jpg')
    expect(config.twitter.title).toContain('Test Page')
    expect(config.twitter.image).toContain('/images/test.jpg')
  })

  it('uses site description as fallback when none provided', () => {
    const config = getSeoConfig({
      title: 'No Desc Page',
      url: '/no-desc'
    })

    expect(config.description).toBe(defaultSeoConfig.description)
  })

  it('uses default og-image when no image provided', () => {
    const config = getSeoConfig({
      title: 'No Image',
      url: '/no-image'
    })

    expect(config.openGraph.images[0].url).toContain('/og-image.jpg')
    expect(config.twitter.image).toContain('/og-image.jpg')
  })

  it('appends site title to page title', () => {
    const config = getSeoConfig({
      title: 'My Page',
      url: '/my-page'
    })

    expect(config.title).toMatch(/My Page — .+/)
  })
})

describe('serializeSchema', () => {
  it('returns null for falsy input', () => {
    expect(serializeSchema(null)).toBeNull()
    expect(serializeSchema(undefined)).toBeNull()
  })

  it('serializes valid JSON-LD schema', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Test Site'
    }

    const result = serializeSchema(schema)
    expect(result).toContain('<script type="application/ld+json">')
    expect(result).toContain('"@context":"https://schema.org"')
    expect(result).toContain('"name":"Test Site"')
    expect(result).toContain('</script>')
  })

  it('escapes </script> tags to prevent XSS', () => {
    const schema = {
      description: 'test</script><script>alert("xss")</script>'
    }

    const result = serializeSchema(schema)
    expect(result).not.toContain('</script><script>')
    expect(result).toContain('<\\/script>')
  })
})
