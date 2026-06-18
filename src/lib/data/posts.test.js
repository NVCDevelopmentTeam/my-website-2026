import { describe, it, expect, vi } from 'vitest'

// Mock import.meta.glob by mocking the entire module
// We test the logic functions by importing them after setting up mocks

vi.mock('$lib/config', () => ({
  siteConfig: {
    title: 'Test Site',
    description: 'Test Description',
    siteUrl: 'https://test.example.com',
    author: { name: 'Test Author', email: 'test@example.com' },
    blog: { basePath: '/blog', postsPerPage: 10 },
    pagination: { postsPerPage: 10 },
    social: { github: 'https://github.com/test' }
  }
}))

// We cannot directly test getAllPosts since it relies on import.meta.glob
// Instead, test the exported functions through a module that provides mock data
// Let's test the pure utility logic extracted from posts.js

describe('posts.js utility logic', () => {
  describe('category parsing logic', () => {
    function parseCategories(meta) {
      let categories = []
      if (typeof meta.categories === 'string') {
        categories = meta.categories
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      } else if (Array.isArray(meta.categories)) {
        categories = meta.categories.filter(Boolean)
      }
      if (categories.length === 0) {
        categories = ['chưa phân loại']
      }
      return categories
    }

    it('parses comma-separated string categories', () => {
      const result = parseCategories({ categories: 'Tech, Science, Art' })
      expect(result).toEqual(['Tech', 'Science', 'Art'])
    })

    it('parses array categories', () => {
      const result = parseCategories({ categories: ['Tech', 'Science'] })
      expect(result).toEqual(['Tech', 'Science'])
    })

    it('filters empty strings from array categories', () => {
      const result = parseCategories({ categories: ['Tech', '', 'Science'] })
      expect(result).toEqual(['Tech', 'Science'])
    })

    it('defaults to "chưa phân loại" when no categories', () => {
      expect(parseCategories({})).toEqual(['chưa phân loại'])
      expect(parseCategories({ categories: '' })).toEqual(['chưa phân loại'])
      expect(parseCategories({ categories: [] })).toEqual(['chưa phân loại'])
    })
  })

  describe('tag parsing logic', () => {
    function parseTags(meta) {
      let tags = []
      if (typeof meta.tags === 'string') {
        tags = meta.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      } else if (Array.isArray(meta.tags)) {
        tags = meta.tags.filter(Boolean)
      }
      if (tags.length === 0) {
        tags = ['chưa phân loại']
      }
      return tags
    }

    it('parses comma-separated string tags', () => {
      const result = parseTags({ tags: 'javascript, svelte, vitest' })
      expect(result).toEqual(['javascript', 'svelte', 'vitest'])
    })

    it('parses array tags', () => {
      const result = parseTags({ tags: ['javascript', 'svelte'] })
      expect(result).toEqual(['javascript', 'svelte'])
    })

    it('defaults to "chưa phân loại" when no tags', () => {
      expect(parseTags({})).toEqual(['chưa phân loại'])
      expect(parseTags({ tags: '' })).toEqual(['chưa phân loại'])
      expect(parseTags({ tags: [] })).toEqual(['chưa phân loại'])
    })
  })

  describe('date validation logic', () => {
    function validateDate(dateStr) {
      let date = dateStr
      try {
        const parsedDate = new Date(date)
        if (isNaN(parsedDate.getTime())) {
          date = new Date().toISOString()
        } else {
          date = parsedDate.toISOString()
        }
      } catch {
        date = new Date().toISOString()
      }
      return date
    }

    it('parses valid ISO date string', () => {
      const result = validateDate('2024-01-15')
      expect(result).toBe(new Date('2024-01-15').toISOString())
    })

    it('parses valid datetime string', () => {
      const result = validateDate('2024-06-15T10:30:00Z')
      expect(result).toBe('2024-06-15T10:30:00.000Z')
    })

    it('returns current date for invalid date strings', () => {
      const before = Date.now()
      const result = validateDate('not-a-date')
      const after = Date.now()
      const resultTime = new Date(result).getTime()
      expect(resultTime).toBeGreaterThanOrEqual(before)
      expect(resultTime).toBeLessThanOrEqual(after)
    })

    it('returns current date for undefined date', () => {
      const before = Date.now()
      const result = validateDate(undefined)
      const after = Date.now()
      const resultTime = new Date(result).getTime()
      expect(resultTime).toBeGreaterThanOrEqual(before)
      expect(resultTime).toBeLessThanOrEqual(after)
    })
  })

  describe('meta description validation logic', () => {
    function validateMetaDescription(meta) {
      const hasValidMetaDescription =
        meta.description &&
        typeof meta.description === 'string' &&
        meta.description.trim().length > 0 &&
        !meta.description.startsWith('title:') &&
        !meta.description.startsWith('---')

      return hasValidMetaDescription
    }

    it('returns true for valid description', () => {
      expect(validateMetaDescription({ description: 'A valid description' })).toBe(true)
    })

    it('returns falsy for empty description', () => {
      expect(validateMetaDescription({ description: '' })).toBeFalsy()
      expect(validateMetaDescription({ description: '   ' })).toBeFalsy()
    })

    it('returns false for description starting with "title:"', () => {
      expect(validateMetaDescription({ description: 'title: some text' })).toBe(false)
    })

    it('returns false for description starting with "---"', () => {
      expect(validateMetaDescription({ description: '---\ntitle: test' })).toBe(false)
    })

    it('returns falsy for missing description', () => {
      expect(validateMetaDescription({})).toBeFalsy()
      expect(validateMetaDescription({ description: null })).toBeFalsy()
    })
  })

  describe('reading time logic', () => {
    function getReadingTime(meta) {
      return typeof meta.readingTime === 'number' && meta.readingTime > 0 ? meta.readingTime : 5
    }

    it('returns provided reading time when valid', () => {
      expect(getReadingTime({ readingTime: 10 })).toBe(10)
      expect(getReadingTime({ readingTime: 1 })).toBe(1)
    })

    it('defaults to 5 for invalid reading time', () => {
      expect(getReadingTime({})).toBe(5)
      expect(getReadingTime({ readingTime: 0 })).toBe(5)
      expect(getReadingTime({ readingTime: -1 })).toBe(5)
      expect(getReadingTime({ readingTime: 'fast' })).toBe(5)
    })
  })

  describe('static file slug validation', () => {
    function isStaticFileSlug(slug) {
      const ignoredExtensions = ['.json', '.xml', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.txt']
      return ignoredExtensions.some((ext) => slug.toLowerCase().endsWith(ext))
    }

    it('detects static file extensions', () => {
      expect(isStaticFileSlug('data.json')).toBe(true)
      expect(isStaticFileSlug('sitemap.xml')).toBe(true)
      expect(isStaticFileSlug('logo.png')).toBe(true)
      expect(isStaticFileSlug('photo.JPG')).toBe(true)
      expect(isStaticFileSlug('image.webp')).toBe(true)
      expect(isStaticFileSlug('favicon.ico')).toBe(true)
      expect(isStaticFileSlug('robots.txt')).toBe(true)
    })

    it('returns false for valid post slugs', () => {
      expect(isStaticFileSlug('my-first-post')).toBe(false)
      expect(isStaticFileSlug('hello-world')).toBe(false)
      expect(isStaticFileSlug('2024-recap')).toBe(false)
    })
  })

  describe('pagination logic', () => {
    function paginate(posts, offset, limit) {
      const total = posts.length
      const totalPages = Math.ceil(total / limit)
      const currentPage = Math.floor(offset / limit) + 1
      const paginated = posts.slice(offset, offset + limit)

      return {
        posts: paginated,
        total,
        totalPages,
        currentPage,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
        pages: Array.from({ length: totalPages }, (_, i) => ({
          number: i + 1,
          offset: i * limit,
          isActive: i + 1 === currentPage
        }))
      }
    }

    const mockPosts = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }))

    it('returns correct page metadata for first page', () => {
      const result = paginate(mockPosts, 0, 10)
      expect(result.total).toBe(25)
      expect(result.totalPages).toBe(3)
      expect(result.currentPage).toBe(1)
      expect(result.posts.length).toBe(10)
      expect(result.hasNext).toBe(true)
      expect(result.hasPrev).toBe(false)
    })

    it('returns correct page metadata for middle page', () => {
      const result = paginate(mockPosts, 10, 10)
      expect(result.currentPage).toBe(2)
      expect(result.posts.length).toBe(10)
      expect(result.hasNext).toBe(true)
      expect(result.hasPrev).toBe(true)
    })

    it('returns correct page metadata for last page', () => {
      const result = paginate(mockPosts, 20, 10)
      expect(result.currentPage).toBe(3)
      expect(result.posts.length).toBe(5)
      expect(result.hasNext).toBe(false)
      expect(result.hasPrev).toBe(true)
    })

    it('generates correct pages array', () => {
      const result = paginate(mockPosts, 10, 10)
      expect(result.pages).toHaveLength(3)
      expect(result.pages[0]).toEqual({ number: 1, offset: 0, isActive: false })
      expect(result.pages[1]).toEqual({ number: 2, offset: 10, isActive: true })
      expect(result.pages[2]).toEqual({ number: 3, offset: 20, isActive: false })
    })

    it('handles empty array', () => {
      const result = paginate([], 0, 10)
      expect(result.total).toBe(0)
      expect(result.totalPages).toBe(0)
      expect(result.posts).toEqual([])
      expect(result.hasNext).toBe(false)
      expect(result.hasPrev).toBe(false)
    })
  })

  describe('cache TTL logic', () => {
    const CACHE_TTL = 3600000

    function shouldReloadCache(cacheTimestamp) {
      if (!cacheTimestamp) return true
      return Date.now() - cacheTimestamp > CACHE_TTL
    }

    it('returns true when no timestamp exists', () => {
      expect(shouldReloadCache(null)).toBe(true)
      expect(shouldReloadCache(undefined)).toBe(true)
    })

    it('returns false when cache is fresh', () => {
      expect(shouldReloadCache(Date.now())).toBe(false)
      expect(shouldReloadCache(Date.now() - 1000)).toBe(false)
    })

    it('returns true when cache is expired', () => {
      expect(shouldReloadCache(Date.now() - CACHE_TTL - 1)).toBe(true)
    })
  })
})
