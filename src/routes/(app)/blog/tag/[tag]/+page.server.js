import { getFilteredPosts, getAllTags } from '$lib/data/posts.server'
import { siteConfig } from '$lib/config'
import { error } from '@sveltejs/kit'
import { building } from '$app/environment'

export const prerender = true

export async function entries() {
  const tags = getAllTags()
  return tags.map((tag) => ({ tag: tag.slug }))
}

export async function load({ params, url }) {
  const tagSlug = params.tag

  if (!tagSlug) {
    error(400, 'Tag không hợp lệ.')
  }

  // Get all tags to find matching slug
  const tags = getAllTags()
  const tagData = tags.find((t) => t.slug === tagSlug)

  if (!tagData) {
    error(404, `Không tìm thấy tag "${tagSlug}".`)
  }

  // Current page - avoid accessing during prerender
  const pageParam = building ? null : url.searchParams.get('page')
  const currentPage =
    pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0 ? Number(pageParam) : 1

  const perPage = siteConfig.pagination.postsPerPage
  const offset = (currentPage - 1) * perPage

  try {
    // Get filtered posts by tag title
    const { posts, total, totalPages } = getFilteredPosts({
      offset,
      limit: perPage,
      tag: tagData.title
    })

    // Handle empty tag case
    if (total === 0) {
      return {
        tag: tagData,
        posts: [],
        // Metadata for Pagination component
        metadata: {
          page: 1,
          total: 0
          // baseUrl auto-detected: /blog/tag/{slug}
        },
        site: siteConfig
      }
    }

    // Check for page overflow
    if (currentPage > totalPages && totalPages > 0) {
      error(404, `Trang ${currentPage} không tồn tại trong tag "${tagData.title}".`)
    }

    return {
      tag: tagData,
      posts,
      // Metadata for Pagination component - clean & simple
      metadata: {
        page: currentPage,
        total: total
        // baseUrl will be auto-detected from URL: /blog/tag/{tagSlug}
        // No need to pass slug or baseUrl - Pagination component handles it!
      },
      site: siteConfig
    }
  } catch (err) {
    console.error('Error loading Tag page:', err)
    error(500, 'Không thể tải posts theo tag này.')
  }
}
