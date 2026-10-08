import { siteConfig } from '#lib/config.js'
import { slugify } from '#lib/utils/slugify.js'
import { truncate } from '#lib/utils/truncate.js'
import { parseList } from '#lib/utils/parseList.js'
import { toISODate } from '#lib/utils/date.js'

// Load only metadata for all markdown files to keep the bundle small
/** Frontmatter is free-form (written by hand / via the CMS), so values are untyped */
const modules = /** @type {Record<string, Record<string, any>>} */ (
  import.meta.glob('/src/lib/contents/posts/*.md', {
    eager: true,
    import: 'metadata'
  })
)

/**
 * @typedef {object} PostMetadata
 * @property {string} slug
 * @property {string} title
 * @property {string} author
 * @property {string} date - ISO 8601
 * @property {string} updated - ISO 8601
 * @property {string[]} categories
 * @property {string[]} tags
 * @property {string} description - Meta description (≤160 chars)
 * @property {string} preview - Longer excerpt for listings
 * @property {number} readingTime - Minutes
 * @property {boolean} draft
 * @property {string | null} image
 * @property {any[]} toc
 * @property {number} [_wordsCount]
 *
 * @typedef {{ slug: string, rawName: string, timestamp: number, metadata: PostMetadata }} Post
 * @typedef {{ metadata: { title: string, slug: string, description: string, count: number } }} CategoryItem
 * @typedef {{ name: string, slug: string, count: number }} TagItem
 */

/* Cache layer — modules are eagerly loaded once, no TTL needed for static site */
/** @type {Post[] | null} */
var cachedPosts = null
/** @type {CategoryItem[] | null} */
var cachedCategories = null
/** @type {TagItem[] | null} */
var cachedTags = null

/**
 * Get all posts with metadata
 * @returns {Post[]}
 */
function getAllPosts() {
  if (cachedPosts) return cachedPosts

  var posts = Object.entries(modules)
    .map(function ([path, metadata]) {
      var filename = path.split('/').pop()?.replace('.md', '') || 'untitled'
      var meta = metadata || {}

      // `slug` may be typed by hand in the CMS (spaces, diacritics, upper case) → normalise
      var slug = slugify(meta.slug) || slugify(filename)
      var title = meta.title || filename
      var author = meta.author || siteConfig?.author?.name || 'Anonymous'

      // Validate date
      var date = toISODate(meta.date)

      // Parse categories and tags from comma-separated strings
      var categories = parseList(meta.categories, 'chưa phân loại')
      var tags = parseList(meta.tags, 'chưa phân loại')

      // Meta description - short for SEO (150-160 chars)
      var hasValidMetaDescription =
        meta.description &&
        typeof meta.description === 'string' &&
        meta.description.trim().length > 0 &&
        !meta.description.startsWith('title:') &&
        !meta.description.startsWith('---')

      var metaDescription = hasValidMetaDescription
        ? truncate(meta.description.trim(), 160)
        : truncate(title, 60)

      // Preview - longer excerpt for post listings
      var hasValidPreview =
        meta.preview && typeof meta.preview === 'string' && meta.preview.trim().length > 0

      var preview = hasValidPreview ? meta.preview.trim() : meta.excerpt || metaDescription

      // Reading time estimate
      var readingTime =
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
          description: metaDescription,
          preview,
          readingTime,
          draft: meta.draft === true || meta.draft === 'true',
          image: meta.image || null,
          toc: meta.toc || [],
          _wordsCount: meta._wordsCount
        }
      }
    })
    .filter(function (post) {
      // Exclude draft posts in production
      return !post.metadata.draft
    })

  // Sort by date descending
  cachedPosts = posts.sort(function (a, b) {
    return b.timestamp - a.timestamp
  })

  return cachedPosts
}

/* Get filtered posts with pagination */
export function getFilteredPosts({
  offset = 0,
  limit = siteConfig?.pagination?.postsPerPage || 10,
  category = '',
  author = '',
  tag = '',
  year = null,
  month = null
} = {}) {
  // Normalize limit: -1 or falsy (except 0) means "return all"
  var effectiveLimit = limit === -1 || limit === Infinity ? Number.MAX_SAFE_INTEGER : limit || 10
  var posts = getAllPosts()

  // Filter by category
  if (category && category.trim()) {
    var catNormalized = slugify(category.trim())
    posts = posts.filter(function (p) {
      return p.metadata.categories.some(function (c) {
        return slugify(c) === catNormalized
      })
    })
  }

  if (author && author.trim()) {
    var authorLower = author.trim().toLowerCase()
    posts = posts.filter(function (p) {
      return p.metadata.author.toLowerCase() === authorLower
    })
  }

  if (tag && tag.trim()) {
    var tagNormalized = slugify(tag.trim())
    posts = posts.filter(function (p) {
      return p.metadata.tags.some(function (t) {
        return slugify(t) === tagNormalized
      })
    })
  }

  if (year) {
    var targetYear = parseInt(year)
    if (!isNaN(targetYear)) {
      posts = posts.filter(function (p) {
        return new Date(p.metadata.date).getFullYear() === targetYear
      })
    }
  }

  if (month && year) {
    var targetMonth = parseInt(month)
    var targetYearForMonth = parseInt(year)
    if (!isNaN(targetMonth) && !isNaN(targetYearForMonth)) {
      posts = posts.filter(function (p) {
        var postDate = new Date(p.metadata.date)
        return (
          postDate.getFullYear() === targetYearForMonth && postDate.getMonth() + 1 === targetMonth
        )
      })
    }
  }

  var total = posts.length
  var totalPages = Math.ceil(total / effectiveLimit)
  var currentPage = Math.floor(offset / effectiveLimit) + 1
  var paginated =
    effectiveLimit >= Number.MAX_SAFE_INTEGER
      ? posts.slice(offset)
      : posts.slice(offset, offset + effectiveLimit)

  return {
    posts: paginated,
    total,
    totalPages,
    currentPage,
    limit: effectiveLimit,
    offset,
    hasNext: effectiveLimit < Number.MAX_SAFE_INTEGER && offset + effectiveLimit < total,
    hasPrev: offset > 0,
    pages: Array.from({ length: totalPages }, function (_, i) {
      return {
        number: i + 1,
        offset: i * effectiveLimit,
        isActive: i + 1 === currentPage
      }
    }),
    filters: { category, author, tag, year, month }
  }
}

/**
 * Get single post by slug
 * @param {string} slug
 * @returns {Post}
 */
export function getPostBySlug(slug) {
  if (!slug) {
    throw new Error('Slug is required')
  }

  // Ignore static asset paths
  var ignoredExtensions = ['.json', '.xml', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.txt']
  if (
    ignoredExtensions.some(function (ext) {
      return slug.toLowerCase().endsWith(ext)
    })
  ) {
    throw new Error('Invalid slug (static file): ' + slug)
  }

  var posts = getAllPosts()
  var normalizedSlug = slugify(slug)
  var post = posts.find(function (p) {
    return p.slug === normalizedSlug || slugify(p.rawName) === normalizedSlug
  })

  if (!post) {
    throw new Error('Post not found: ' + slug)
  }

  return post
}

/* Shared aggregation helper */

/**
 * Aggregate a metadata array field across all posts into a
 * deduplicated, counted list sorted by count descending.
 *
 * @param {string} field      - Metadata array key (e.g. 'categories', 'tags').
 * @param {(title: string, slug: string, count: number) => any} mapEntry - formatter.
 * @returns {any[]}
 */
function collectByField(field, mapEntry) {
  var posts = getAllPosts()
  /** @type {Map<string, { title: string, slug: string, count: number }>} */
  var map = new Map()

  posts.forEach(function (post) {
    /** @type {any[]} */
    var items = /** @type {Record<string, any>} */ (post.metadata)[field] || []
    items.forEach(function (item) {
      var title = typeof item === 'string' ? item.trim() : ''
      if (!title) return
      var slug = slugify(title)
      var existing = map.get(slug)
      if (existing) {
        existing.count++
      } else {
        map.set(slug, { title, slug, count: 1 })
      }
    })
  })

  return Array.from(map.values())
    .map(function ({ title, slug, count }) {
      return mapEntry(title, slug, count)
    })
    .sort(function (a, b) {
      return (b.metadata?.count ?? b.count) - (a.metadata?.count ?? a.count)
    })
}

/**
 * Get all categories
 * @returns {CategoryItem[]}
 */
export function getAllCategories() {
  if (cachedCategories) return cachedCategories

  cachedCategories = collectByField('categories', function (title, slug, count) {
    return {
      metadata: {
        title,
        slug,
        description: 'Category ' + title + ' has ' + count + ' posts',
        count
      }
    }
  })

  return cachedCategories
}

/**
 * Get all tags
 * @returns {TagItem[]}
 */
export function getAllTags() {
  if (cachedTags) return cachedTags

  cachedTags = collectByField('tags', function (name, slug, count) {
    return { name, slug, count }
  })

  return cachedTags
}

/* Get recent posts */
export function getRecentPosts(limit = 5) {
  var posts = getAllPosts()
  return posts.slice(0, limit)
}

/* Force reload cache */
export function reloadCache() {
  cachedPosts = null
  cachedCategories = null
  cachedTags = null
  getAllPosts()
}
