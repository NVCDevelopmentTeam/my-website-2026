import { siteConfig } from '$lib/config'
import { browser } from '$app/environment'
import { dev } from '$app/environment'

// Server-only guard
if (browser) {
  throw new Error('posts.server.js can only run on server')
}

// Load all markdown files with metadata
const modules = import.meta.glob('/src/lib/contents/posts/*.md', { eager: true })

/* -----------------------------------------------------
   🧩 Cache Layer
----------------------------------------------------- */
let cachedPosts = null
let cachedCategories = null
let cachedTags = null
let cachedAuthors = null

/* -----------------------------------------------------
   🧩 Get All Posts with Metadata
----------------------------------------------------- */
function getAllPosts() {
  if (cachedPosts) return cachedPosts

  const posts = Object.entries(modules)
    .map(([path, module]) => {
      const filename = path.split('/').pop()?.replace('.md', '') || 'untitled'
      const meta = module?.metadata || {}

      const slug = meta.slug || filename
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

      // Normalize arrays/strings for categories and tags
      const normalizeArray = (val) => {
        if (Array.isArray(val)) return val.filter(Boolean).map((v) => v.trim())
        if (typeof val === 'string')
          return val
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        return []
      }

      const categories = normalizeArray(meta.categories)
      const tags = normalizeArray(meta.tags)
      const toc = Array.isArray(meta.toc) ? meta.toc : []

      // Description validation
      const hasValidDescription =
        meta.description &&
        typeof meta.description === 'string' &&
        meta.description.trim().length > 0 &&
        meta.description !== 'Bài viết chưa có mô tả.' &&
        !meta.description.startsWith('title:') &&
        !meta.description.startsWith('---')

      const description = hasValidDescription ? meta.description.trim() : 'Bài viết chưa có mô tả.'

      // Reading time
      const readingTime =
        typeof meta.readingTime === 'number' && meta.readingTime > 0 ? meta.readingTime : 5

      return {
        slug,
        rawName: filename,
        metadata: {
          slug,
          title,
          author,
          date,
          updated: meta.updated || date,
          categories,
          tags,
          description,
          toc,
          readingTime,
          featured: meta.featured === true,
          draft: meta.draft === true,
          image: meta.image || null,
          excerpt: meta.excerpt || description
        }
      }
    })
    .filter((post) => {
      if (!dev && post.metadata.draft) {
        return false
      }
      return true
    })

  // Sort by date descending
  cachedPosts = posts.sort((a, b) => {
    return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
  })

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
  search = '',
  featured = false,
  year = null,
  month = null
} = {}) {
  let posts = getAllPosts()

  if (featured) {
    posts = posts.filter((p) => p.metadata.featured === true)
  }

  if (category && category.trim()) {
    const catLower = category.trim().toLowerCase()
    posts = posts.filter((p) => p.metadata.categories.some((c) => c.toLowerCase() === catLower))
  }

  if (author && author.trim()) {
    const authorLower = author.trim().toLowerCase()
    posts = posts.filter((p) => p.metadata.author.toLowerCase() === authorLower)
  }

  if (tag && tag.trim()) {
    const tagLower = tag.trim().toLowerCase()
    posts = posts.filter((p) => p.metadata.tags.some((t) => t.toLowerCase() === tagLower))
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

  if (search && search.trim()) {
    const query = search.trim().toLowerCase()
    posts = posts.filter((p) => {
      const { title, description, tags, categories } = p.metadata
      return (
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        tags.some((t) => t.toLowerCase().includes(query)) ||
        categories.some((c) => c.toLowerCase().includes(query))
      )
    })
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
    filters: { category, author, tag, search, featured, year, month }
  }
}

/* -----------------------------------------------------
   🧩 Get Single Post by Slug
----------------------------------------------------- */
export function getPostBySlug(slug) {
  if (!slug) {
    throw new Error('Slug is required')
  }

  const posts = getAllPosts()
  const post = posts.find((p) => p.slug === slug || p.rawName === slug)

  if (!post) {
    throw new Error(`Post not found: ${slug}`)
  }

  return post
}

/* -----------------------------------------------------
   🧩 Get Related Posts
----------------------------------------------------- */
export function getRelatedPosts(slug, limit = 3) {
  try {
    const currentPost = getPostBySlug(slug)
    const allPosts = getAllPosts()

    const related = allPosts
      .filter((p) => p.slug !== slug)
      .map((p) => {
        const tagMatches = p.metadata.tags.filter((t) =>
          currentPost.metadata.tags.includes(t)
        ).length
        const catMatches = p.metadata.categories.filter((c) =>
          currentPost.metadata.categories.includes(c)
        ).length
        const score = tagMatches * 2 + catMatches * 3
        return { ...p, score }
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score
        }
        return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
      })
      .slice(0, limit)
      .map(({ score, ...post }) => {
        void score
        return post
      })

    return related
  } catch {
    return []
  }
}

/* -----------------------------------------------------
   🧩 Get All Categories
----------------------------------------------------- */
export function getAllCategories() {
  if (cachedCategories) return cachedCategories

  const posts = getAllPosts()
  const map = new Map()

  posts.forEach((post) => {
    post.metadata.categories.forEach((cat) => {
      const normalized = cat.trim()
      if (normalized) {
        map.set(normalized, (map.get(normalized) || 0) + 1)
      }
    })
  })

  cachedCategories = Array.from(map.entries())
    .map(([title, count]) => ({
      title,
      count,
      slug: slugify(title)
    }))
    .sort((a, b) => b.count - a.count)

  return cachedCategories
}

/* -----------------------------------------------------
   🧩 Get All Tags
----------------------------------------------------- */
export function getAllTags() {
  if (cachedTags) return cachedTags

  const posts = getAllPosts()
  const map = new Map()

  posts.forEach((post) => {
    post.metadata.tags.forEach((tag) => {
      const normalized = tag.trim()
      if (normalized) {
        map.set(normalized, (map.get(normalized) || 0) + 1)
      }
    })
  })

  cachedTags = Array.from(map.entries())
    .map(([title, count]) => ({
      title,
      count,
      slug: slugify(title)
    }))
    .sort((a, b) => b.count - a.count)

  return cachedTags
}

/* -----------------------------------------------------
   🧩 Get All Authors
----------------------------------------------------- */
export function getAllAuthors() {
  if (cachedAuthors) return cachedAuthors

  const posts = getAllPosts()
  const map = new Map()

  posts.forEach((post) => {
    const author = post.metadata.author.trim()
    if (author) {
      map.set(author, (map.get(author) || 0) + 1)
    }
  })

  cachedAuthors = Array.from(map.entries())
    .map(([title, count]) => ({
      title,
      count,
      slug: slugify(title)
    }))
    .sort((a, b) => b.count - a.count)

  return cachedAuthors
}

/* -----------------------------------------------------
   🧩 Get Posts Archive
----------------------------------------------------- */
export function getPostsArchive() {
  const posts = getAllPosts()
  const archive = {}

  posts.forEach((post) => {
    const date = new Date(post.metadata.date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    if (!archive[year]) archive[year] = {}
    if (!archive[year][month]) archive[year][month] = []

    archive[year][month].push(post)
  })

  return Object.entries(archive)
    .map(([year, months]) => ({
      year: parseInt(year),
      months: Object.entries(months)
        .map(([month, posts]) => ({
          month: parseInt(month),
          monthName: new Date(2000, parseInt(month) - 1).toLocaleString('vi-VN', { month: 'long' }),
          count: posts.length,
          posts
        }))
        .sort((a, b) => b.month - a.month)
    }))
    .sort((a, b) => b.year - a.year)
}

/* -----------------------------------------------------
   🧩 Get Recent Posts
----------------------------------------------------- */
export function getRecentPosts(limit = 5) {
  const posts = getAllPosts()
  return posts.slice(0, limit)
}

/* -----------------------------------------------------
   🧩 Get Featured Posts
----------------------------------------------------- */
export function getFeaturedPosts(limit = 3) {
  const posts = getAllPosts()
  return posts.filter((p) => p.metadata.featured === true).slice(0, limit)
}

/* -----------------------------------------------------
   🧩 Search Posts
----------------------------------------------------- */
export function searchPosts(query, limit = 10) {
  if (!query || !query.trim()) return []

  const q = query.trim().toLowerCase()
  const posts = getAllPosts()

  return posts
    .map((p) => {
      let score = 0
      const { title, description, tags, categories } = p.metadata

      if (title.toLowerCase().includes(q)) score += 10
      if (description.toLowerCase().includes(q)) score += 5
      if (tags.some((t) => t.toLowerCase().includes(q))) score += 3
      if (categories.some((c) => c.toLowerCase().includes(q))) score += 3

      return { ...p, score }
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...post }) => {
      void score
      return post
    })
}

/* -----------------------------------------------------
   🧩 Get Statistics
----------------------------------------------------- */
export function getPostStats() {
  const posts = getAllPosts()
  const categories = getAllCategories()
  const tags = getAllTags()
  const authors = getAllAuthors()

  const totalWords = posts.reduce((sum, p) => sum + (p.metadata._wordsCount || 0), 0)

  const avgReadingTime =
    posts.length > 0
      ? Math.round(posts.reduce((sum, p) => sum + p.metadata.readingTime, 0) / posts.length)
      : 0

  return {
    totalPosts: posts.length,
    totalCategories: categories.length,
    totalTags: tags.length,
    totalAuthors: authors.length,
    totalWords,
    avgReadingTime,
    featuredCount: posts.filter((p) => p.metadata.featured).length
  }
}

/* -----------------------------------------------------
   🧩 Clear All Caches
----------------------------------------------------- */
export function clearCache() {
  cachedPosts = null
  cachedCategories = null
  cachedTags = null
  cachedAuthors = null
}

/* -----------------------------------------------------
   🧩 Helper: Slugify
----------------------------------------------------- */
function slugify(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
