import { siteConfig } from '$lib/config'
import { slugify } from '$lib/utils/slugify'
import { truncate } from '$lib/utils/truncate'
import { parseList } from '$lib/utils/parseList'
import { toISODate } from '$lib/utils/date'

// Load only metadata for all markdown files to keep the bundle small
const modules = import.meta.glob('/src/lib/contents/posts/*.md', {
  eager: true,
  import: 'metadata'
})

/* Cache layer — modules are eagerly loaded once, no TTL needed for static site */
var cachedPosts = null
var cachedCategories = null
var cachedTags = null

/* Get all posts with metadata */
function getAllPosts() {
  if (cachedPosts) return cachedPosts

  var posts = Object.entries(modules)
    .map(function ([path, metadata]) {
      var filename = path.split('/').pop()?.replace('.md', '') || 'untitled'
      var meta = metadata || {}

      var slug = meta.slug || slugify(filename)
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

/* Get single post by slug */
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
 * @param {function} mapEntry - `(title, slug, count) => object` formatter.
 * @returns {object[]}
 */
function collectByField(field, mapEntry) {
  var posts = getAllPosts()
  var map = new Map()

  posts.forEach(function (post) {
    var items = post.metadata[field] || []
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

/* Get all categories */
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

/* Get all tags */
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
