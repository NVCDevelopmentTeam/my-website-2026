import { describe, it, expect } from 'vitest'

// Test the logic extracted from pages.js without needing import.meta.glob

describe('pages.js utility logic', () => {
  describe('slug extraction from filepath', () => {
    function extractSlug(filepath, metadata) {
      const filename = filepath.split('/').pop().replace('.md', '')
      return metadata.slug || filename
    }

    it('extracts slug from metadata when available', () => {
      expect(extractSlug('/src/lib/contents/pages/about.md', { slug: 'custom-slug' })).toBe(
        'custom-slug'
      )
    })

    it('falls back to filename when no metadata slug', () => {
      expect(extractSlug('/src/lib/contents/pages/about.md', {})).toBe('about')
      expect(extractSlug('/src/lib/contents/pages/privacy-policy.md', {})).toBe('privacy-policy')
    })
  })

  describe('page metadata construction', () => {
    function buildPageMetadata(metadata, slug) {
      const preview = metadata.description || '...'
      return {
        slug,
        metadata: {
          title: metadata.title ?? slug,
          description: metadata.description ?? preview,
          menu: metadata.menu || ''
        },
        priority: metadata.priority ?? 0.7
      }
    }

    it('uses provided title', () => {
      const result = buildPageMetadata({ title: 'About Us' }, 'about')
      expect(result.metadata.title).toBe('About Us')
    })

    it('falls back to slug for title when not provided', () => {
      const result = buildPageMetadata({}, 'about')
      expect(result.metadata.title).toBe('about')
    })

    it('uses description from metadata', () => {
      const result = buildPageMetadata({ description: 'Page desc' }, 'test')
      expect(result.metadata.description).toBe('Page desc')
    })

    it('uses "..." as fallback description', () => {
      const result = buildPageMetadata({}, 'test')
      expect(result.metadata.description).toBe('...')
    })

    it('uses menu from metadata', () => {
      const result = buildPageMetadata({ menu: 'nav' }, 'test')
      expect(result.metadata.menu).toBe('nav')
    })

    it('defaults menu to empty string', () => {
      const result = buildPageMetadata({}, 'test')
      expect(result.metadata.menu).toBe('')
    })

    it('uses priority from metadata', () => {
      const result = buildPageMetadata({ priority: 0.9 }, 'test')
      expect(result.priority).toBe(0.9)
    })

    it('defaults priority to 0.7', () => {
      const result = buildPageMetadata({}, 'test')
      expect(result.priority).toBe(0.7)
    })
  })

  describe('getAllPages filtering and sorting logic', () => {
    const mockPages = [
      { metadata: { title: 'Zebra', menu: 'nav' } },
      { metadata: { title: 'Alpha', menu: 'nav' } },
      { metadata: { title: 'Middle', menu: 'footer' } },
      { metadata: { title: 'Beta', menu: 'nav' } }
    ]

    function getAllPages(pages, options = {}) {
      const { limit = -1, menu = '' } = options
      let resultPages = [...pages]

      if (menu) {
        resultPages = resultPages.filter((page) => page.metadata.menu === menu)
      }

      const sortedPages = [...resultPages].sort((a, b) =>
        a.metadata.title.localeCompare(b.metadata.title)
      )

      const limitedPages = limit > 0 ? sortedPages.slice(0, limit) : sortedPages

      return {
        pages: limitedPages,
        total: pages.length
      }
    }

    it('returns all pages sorted alphabetically', () => {
      const result = getAllPages(mockPages)
      expect(result.pages.map((p) => p.metadata.title)).toEqual([
        'Alpha',
        'Beta',
        'Middle',
        'Zebra'
      ])
      expect(result.total).toBe(4)
    })

    it('filters by menu location', () => {
      const result = getAllPages(mockPages, { menu: 'nav' })
      expect(result.pages.map((p) => p.metadata.title)).toEqual(['Alpha', 'Beta', 'Zebra'])
      expect(result.total).toBe(4) // total is always full count
    })

    it('limits results', () => {
      const result = getAllPages(mockPages, { limit: 2 })
      expect(result.pages).toHaveLength(2)
      expect(result.pages[0].metadata.title).toBe('Alpha')
      expect(result.pages[1].metadata.title).toBe('Beta')
    })

    it('combines menu filter and limit', () => {
      const result = getAllPages(mockPages, { menu: 'nav', limit: 2 })
      expect(result.pages).toHaveLength(2)
      expect(result.pages[0].metadata.title).toBe('Alpha')
      expect(result.pages[1].metadata.title).toBe('Beta')
    })

    it('returns empty array for non-matching menu', () => {
      const result = getAllPages(mockPages, { menu: 'nonexistent' })
      expect(result.pages).toEqual([])
    })

    it('does not mutate original array', () => {
      const original = [...mockPages]
      getAllPages(mockPages, { menu: 'nav', limit: 1 })
      expect(mockPages).toEqual(original)
    })
  })

  describe('getPageBySlug matching logic', () => {
    const mockModules = {
      '/src/lib/contents/pages/about.md': {
        metadata: { title: 'About', slug: 'about-us' },
        default: 'content'
      },
      '/src/lib/contents/pages/contact.md': {
        metadata: { title: 'Contact' },
        default: 'content'
      },
      '/src/lib/contents/pages/index.md': {
        metadata: { title: 'Home', slug: 'home' },
        default: 'content'
      }
    }

    function getPageBySlug(slug, contentModules) {
      const match = Object.entries(contentModules).find(([path, module]) => {
        const filename = path.split('/').pop().replace('.md', '')
        return module.metadata?.slug === slug || filename === slug
      })
      if (!match) throw new Error(`Page not found: ${slug}`)
      const [, module] = match
      return {
        metadata: module.metadata ?? {},
        content: module.default
      }
    }

    it('finds page by custom slug in metadata', () => {
      const result = getPageBySlug('about-us', mockModules)
      expect(result.metadata.title).toBe('About')
    })

    it('finds page by filename when no custom slug', () => {
      const result = getPageBySlug('contact', mockModules)
      expect(result.metadata.title).toBe('Contact')
    })

    it('throws error for non-existent slug', () => {
      expect(() => getPageBySlug('nonexistent', mockModules)).toThrow('Page not found: nonexistent')
    })

    it('returns metadata and content', () => {
      const result = getPageBySlug('home', mockModules)
      expect(result.metadata).toEqual({ title: 'Home', slug: 'home' })
      expect(result.content).toBe('content')
    })
  })
})
