// @ts-nocheck
import { getFilteredPosts, getAllCategories } from '$lib/data/posts'
import { siteConfig } from '$lib/config'
import { error } from '@sveltejs/kit'
import { building } from '$app/environment'

export const prerender = true

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
  const categories = getAllCategories()

  return categories
    .filter((c) => c?.metadata)
    .map((c) => ({
      category: c.metadata.slug
    }))
}

/** @param {Parameters<import('./$types').PageLoad>[0]} event */
export async function load({ params, url, depends }) {
  depends('blog:category')

  const categorySlug = params.category
  if (!categorySlug) {
    error(400, 'Danh mục không hợp lệ.')
  }

  // Get all categories
  const categories = getAllCategories()

  // Find category by slug
  const categoryData = categories.find((c) => c?.metadata?.slug === categorySlug)

  if (!categoryData?.metadata) {
    error(404, `Không tìm thấy danh mục "${categorySlug}".`)
  }

  const metadata = categoryData.metadata
  const perPage = siteConfig.pagination.postsPerPage

  // Get page from query
  const pageParam = building ? null : url.searchParams.get('page')
  let currentPage = Number(pageParam)
  if (!currentPage || currentPage < 1) currentPage = 1

  const offset = (currentPage - 1) * perPage

  try {
    // Get filtered posts by category title
    const result = await getFilteredPosts({
      offset,
      limit: perPage,
      category: metadata.title
    })

    const posts = result?.posts ?? []
    const total = result?.total ?? 0
    const totalPages = Math.max(1, result?.totalPages ?? 1)

    // Check if category has no posts
    if (total === 0) {
      return {
        category: metadata,
        posts: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalPosts: 0,
          hasPrev: false,
          hasNext: false
        }
      }
    }

    // Check if page exceeds limits
    if (currentPage > totalPages) {
      error(404, `Trang ${currentPage} không tồn tại trong danh mục "${metadata.title}".`)
    }

    return {
      category: metadata,
      posts,
      pagination: {
        currentPage,
        totalPages,
        totalPosts: total,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages
      }
    }
  } catch (err) {
    console.error('Error loading category page:', err)
    error(500, 'Không thể tải bài viết trong danh mục này.')
  }
}
