import { siteConfig } from '$lib/config'
import { dev } from '$app/environment'
import { slugify } from '$lib/utils/slugify'
import { truncate } from '$lib/utils/truncate'

// Post preview auto rendering and generate
// Server & Client compatible logic for SSG

// Load only metadata for all markdown files to keep the bundle small
const modules = import.meta.glob('/src/lib/contents/posts/*.md', {
  eager: true,
  import: 'metadata'
})

/* -----------------------------------------------------
   🧩 Cache Layer with Auto Reload
----------------------------------------------------- */
let cachedPosts = null
let cachedCategories = null
let cachedTags = null
let cacheTimestamp = null
const CACHE_TTL = 3600000 // 1 hour - long cache for static site performance

function shouldReloadCache() {
  if (!cacheTimestamp) return true
  return Date.now() - cacheTimestamp > CACHE_TTL
}

/* -----------------------------------------------------
   🧩 Get All Posts with Metadata
----------------------------------------------------- */
function getAllPosts() {
  if (cachedPosts && !shouldReloadCache()) return cachedPosts

  const posts = Object.entries(modules)
    .map(([path, metadata]) => {
      const filename = path.split('/').pop()?.replace('.md', '') || 'untitled'
      const meta = metadata || {}

      const slug = meta.slug || slugify(filename)
      const title = meta.title || filename
      const author = meta.author || siteConfig?.author?.name || 'Ẩn danh'

      // Validate date
      let date = meta.date
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

      // Parse categories from comma-separated string
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

      // Parse tags from comma-separated string
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

      // Meta description - short for SEO (4-10 words)
      const hasValidMetaDescription =
        meta.description &&
        typeof meta.description === 'string' &&
        meta.description.trim().length > 0 &&
        !meta.description.startsWith('title:') &&
        !meta.description.startsWith('---')

      const metaDescription = hasValidMetaDescription
        ? truncate(meta.description.trim(), 160) // SEO standard limit
        : truncate(title, 60)

      // Preview - longer excerpt for post listings (200-265 characters)
      const hasValidPreview =
        meta.preview && typeof meta.preview === 'string' && meta.preview.trim().length > 0

      const preview = hasValidPreview ? meta.preview.trim() : meta.excerpt || metaDescription

      // Reading time
      const readingTime =
        typeof meta.readingTime === 'number' && meta.readingTime > 0 ? meta.readingTime : 5

      return {
        slug,
        rawName: filename,
        timestamp: new Date(date).getTime(),
        metadata: {
          slug,
          title,
          author,
          date,
          updated: meta.updated || date,
          categories,
          tags,
          description: metaDescription, // Short SEO description
          preview, // Longer excerpt for listings
          readingTime,
          draft: meta.draft === true || meta.draft === 'true',
          image: meta.image || null,
          toc: meta.toc || [],
          _wordsCount: meta._wordsCount
        }
      }
    })
    .filter((post) => {
      if (!dev && post.metadata.draft) {
        return false
      }
      return true
    })

  // Sort by date descending using pre-calculated timestamp
  cachedPosts = posts.sort((a, b) => b.timestamp - a.timestamp)

  cacheTimestamp = Date.now()
  return cachedPosts
}

/* -----------------------------------------------------
   🧩 Get Filtered Posts with Pagination
----------------------------------------------------- */
export function getFilteredPosts({
  offset = 0,
  limit = siteConfig?.pagination?.postsPerPage || 10,
  category = '',
  author = '',
  tag = '',
  year = null,
  month = null
} = {}) {
  let posts = getAllPosts()

  // Filter by category - handle both slug and title
  if (category && category.trim()) {
    const catNormalized = slugify(category.trim())
    posts = posts.filter((p) =>
      p.metadata.categories.some((c) => {
        const cSlug = slugify(c)
        return cSlug === catNormalized
      })
    )
  }

  if (author && author.trim()) {
    const authorLower = author.trim().toLowerCase()
    posts = posts.filter((p) => p.metadata.author.toLowerCase() === authorLower)
  }

  if (tag && tag.trim()) {
    const tagNormalized = slugify(tag.trim())
    posts = posts.filter((p) => p.metadata.tags.some((t) => slugify(t) === tagNormalized))
  }

  if (year) {
    const targetYear = parseInt(year)
    if (!isNaN(targetYear)) {
      posts = posts.filter((p) => {
        const postYear = new Date(p.metadata.date).getFullYear()
        return postYear === targetYear
      })
    }
  }

  if (month && year) {
    const targetMonth = parseInt(month)
    const targetYear = parseInt(year)
    if (!isNaN(targetMonth) && !isNaN(targetYear)) {
      posts = posts.filter((p) => {
        const postDate = new Date(p.metadata.date)
        return postDate.getFullYear() === targetYear && postDate.getMonth() + 1 === targetMonth
      })
    }
  }

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
    })),
    filters: { category, author, tag, year, month }
  }
}

/* -----------------------------------------------------
   🧩 Get Single Post by Slug
----------------------------------------------------- */
export function getPostBySlug(slug) {
  if (!slug) {
    throw new Error('Slug is required')
  }

  // Ignore static assets that might hit this route
  const ignoredExtensions = ['.json', '.xml', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.txt']
  if (ignoredExtensions.some((ext) => slug.toLowerCase().endsWith(ext))) {
    throw new Error(`Invalid slug (static file): ${slug}`)
  }

  const posts = getAllPosts()
  const normalizedSlug = slugify(slug)
  const post = posts.find((p) => p.slug === normalizedSlug || slugify(p.rawName) === normalizedSlug)

  if (!post) {
    throw new Error(`Post not found: ${slug}`)
  }

  return post
}

/* -----------------------------------------------------
   🧩 Get All Categories - Vietnamese Slug Format
----------------------------------------------------- */
export function getAllCategories() {
  if (cachedCategories && !shouldReloadCache()) return cachedCategories

  const posts = getAllPosts()
  const map = new Map()

  posts.forEach((post) => {
    post.metadata.categories.forEach((cat) => {
      const title = cat.trim()
      if (!title) return

      const slug = slugify(title)

      // Use slug as key to avoid duplicates
      const existing = map.get(slug)
      if (existing) {
        existing.count++
      } else {
        map.set(slug, { title, slug, count: 1 })
      }
    })
  })

  // Convert to array with metadata structure
  cachedCategories = Array.from(map.values())
    .map(({ title, slug, count }) => ({
      metadata: {
        title,
        slug,
        description: `Danh mục ${title} có ${count} bài viết`,
        count
      }
    }))
    .sort((a, b) => b.metadata.count - a.metadata.count)

  cacheTimestamp = Date.now()
  return cachedCategories
}

/* -----------------------------------------------------
   🧩 Get All Tags - Vietnamese Slug Format
----------------------------------------------------- */
export function getAllTags() {
  if (cachedTags && !shouldReloadCache()) return cachedTags

  const posts = getAllPosts()
  const map = new Map()

  posts.forEach((post) => {
    post.metadata.tags.forEach((tag) => {
      const normalized = tag.trim()
      if (normalized) {
        const slug = slugify(normalized)
        const existing = map.get(slug)
        if (existing) {
          existing.count++
        } else {
          map.set(slug, { name: normalized, slug, count: 1 })
        }
      }
    })
  })

  cachedTags = Array.from(map.values())
    .map(({ name, slug, count }) => ({
      name,
      count,
      slug
    }))
    .sort((a, b) => b.count - a.count)

  cacheTimestamp = Date.now()
  return cachedTags
}

/* -----------------------------------------------------
   🧩 Get Recent Posts
----------------------------------------------------- */
export function getRecentPosts(limit = 5) {
  const posts = getAllPosts()
  return posts.slice(0, limit)
}

/* -----------------------------------------------------
   🧩 Force Reload Cache (for page navigation)
----------------------------------------------------- */
export function reloadCache() {
  cachedPosts = null
  cachedCategories = null
  cachedTags = null
  cacheTimestamp = null
  // Trigger fresh load
  getAllPosts()
  getAllCategories()
  getAllTags()
}

/* -----------------------------------------------------
   🧩 Clear All Caches
----------------------------------------------------- */
export function clearCache() {
  cachedPosts = null
  cachedCategories = null
  cachedTags = null
  cacheTimestamp = null
}
