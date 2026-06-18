import { getFilteredPosts, getAllCategories } from '$lib/data/posts'
import { error, isHttpError } from '@sveltejs/kit'
import { loadPaginatedPosts } from '$lib/utils/pagination'

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

/** @type {import('./$types').PageLoad} */
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

  try {
    const { posts, pagination } = loadPaginatedPosts(
      url,
      { category: metadata.title },
      getFilteredPosts
    )

    // Check if page exceeds limits
    if (pagination.currentPage > pagination.totalPages && pagination.totalPages > 0) {
      error(
        404,
        `Trang ${pagination.currentPage} không tồn tại trong danh mục "${metadata.title}".`
      )
    }

    return {
      category: metadata,
      posts,
      pagination
    }
  } catch (err) {
    if (isHttpError(err)) throw err
    console.error('Error loading category page:', err)
    error(500, 'Không thể tải bài viết trong danh mục này.')
  }
}
