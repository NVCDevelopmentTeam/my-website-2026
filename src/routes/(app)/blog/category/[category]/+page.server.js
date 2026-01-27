import { getFilteredPosts, getAllCategories } from '$lib/data/posts.server'
import { siteConfig } from '$lib/config'
import { error } from '@sveltejs/kit'
import { building } from '$app/environment'

export const prerender = true

export async function entries() {
  const categories = getAllCategories()
  return categories.map((cat) => ({ category: cat.slug }))
}

export async function load({ params, url, depends }) {
  depends('blog:category')

  const categorySlug = params.category
  if (!categorySlug) {
    error(400, 'Danh mục không hợp lệ.')
  }

  // Get all categories
  const categories = getAllCategories()

  // Find category by slug
  const categoryData = categories.find((c) => c.slug === categorySlug)

  if (!categoryData) {
    error(404, `Không tìm thấy danh mục "${categorySlug}".`)
  }

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
      category: categoryData.title
    })

    const posts = result?.posts ?? []
    const total = result?.total ?? 0
    const totalPages = Math.max(1, result?.totalPages ?? 1)

    // Check if category has no posts
    if (total === 0) {
      return {
        category: categoryData,
        posts: [],
        // Metadata for Pagination component
        metadata: {
          page: 1,
          total: 0
          // baseUrl auto-detected: /blog/category/{slug}
        }
      }
    }

    // Check if page exceeds limits
    if (currentPage > totalPages) {
      error(404, `Trang ${currentPage} không tồn tại trong danh mục "${categoryData.title}".`)
    }

    return {
      category: categoryData,
      posts,
      // Metadata for Pagination component - clean & simple
      metadata: {
        page: currentPage,
        total: total
        // baseUrl will be auto-detected from URL: /blog/category/{categorySlug}
        // No need to pass slug or baseUrl - Pagination component handles it!
      }
    }
  } catch (err) {
    console.error('Error loading category page:', err)
    error(500, 'Không thể tải posts trong danh mục này.')
  }
}
