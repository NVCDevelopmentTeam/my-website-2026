import { error } from '@sveltejs/kit'
import { siteConfig } from '#lib/config.js'
import { toCard } from '#lib/data/cards.js'
import { getAllCategories, getAllTags, getFilteredPosts } from '#lib/data/posts.js'

/*
 * Pages of lists of posts (blog, one category, one tag), computed when the site is built and
 * stored as small JSON files (/lists/...). The browser downloads only the page of the list it
 * shows. Before, the code that builds the lists was part of the browser bundle, and with it the
 * full text of every post: the bundle grew with each post that was written.
 */

const perPage = siteConfig.pagination.postsPerPage

/**
 * @param {number} page 1-based
 * @param {Record<string, string>} filters
 */
function listPage(page, filters) {
  const { posts, total, totalPages } = getFilteredPosts({
    offset: (page - 1) * perPage,
    limit: perPage,
    ...filters
  })
  const pages = totalPages || Math.ceil(total / perPage)

  return {
    posts: posts.map(toCard),
    pagination: {
      currentPage: page,
      totalPages: pages,
      totalPosts: total,
      hasPrev: page > 1,
      hasNext: page < pages
    }
  }
}

/** @param {Record<string, string>} filters */
function pageNumbers(filters) {
  const { totalPages } = listPage(1, filters).pagination
  return Array.from({ length: Math.max(totalPages, 1) }, (_, i) => String(i + 1))
}

/** @param {number} page */
export function blogList(page) {
  const { posts, pagination } = listPage(page, {})
  return { posts, pagination: { ...pagination, baseUrl: '/blog' }, site: siteConfig }
}

/** @param {string} slug @param {number} page */
export function categoryList(slug, page) {
  const category = getAllCategories().find((c) => c?.metadata?.slug === slug)?.metadata
  if (!category) error(404, `Không tìm thấy danh mục "${slug}".`)

  const { posts, pagination } = listPage(page, { category: category.title })
  if (page > pagination.totalPages && pagination.totalPages > 0) {
    error(404, `Trang ${page} không tồn tại trong danh mục "${category.title}".`)
  }
  return { category, posts, pagination }
}

/** @param {string} slug @param {number} page */
export function tagList(slug, page) {
  const found = getAllTags().find((t) => t.slug === slug)
  if (!found) error(404, `Không tìm thấy thẻ "${slug}".`)

  const tag = {
    title: found.name,
    slug: found.slug,
    count: found.count,
    description: `Có ${found.count} bài viết với thẻ "${found.name}"`
  }
  const { posts, pagination } = listPage(page, { tag: tag.title })
  if (page > pagination.totalPages && pagination.totalPages > 0) {
    error(404, `Trang ${page} không tồn tại trong thẻ "${tag.title}".`)
  }
  return { tag, posts, pagination, site: siteConfig }
}

// Which pages exist, for the build (prerender entries)
export const blogEntries = () => pageNumbers({}).map((page) => ({ page }))

export const categoryEntries = () =>
  getAllCategories()
    .filter((c) => c?.metadata)
    .flatMap((c) =>
      pageNumbers({ category: c.metadata.title }).map((page) => ({
        category: c.metadata.slug,
        page
      }))
    )

export const tagEntries = () =>
  getAllTags().flatMap((t) => pageNumbers({ tag: t.name }).map((page) => ({ tag: t.slug, page })))
