import { getFilteredPosts, getAllTags } from '$lib/data/posts'
import { siteConfig } from '$lib/config'
import { error, isHttpError } from '@sveltejs/kit'
import { loadPaginatedPosts } from '$lib/utils/pagination'

export const prerender = true

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
  const tags = getAllTags()

  return tags
    .filter((t) => t)
    .map((t) => ({
      tag: t.slug
    }))
}

/** @type {import('./$types').PageLoad} */
export async function load({ params, url }) {
  const tagSlug = params.tag

  if (!tagSlug) {
    error(400, 'Thẻ không hợp lệ.')
  }

  // Get all tags to find matching slug
  const tags = getAllTags()
  const tagData = tags.find((t) => t.slug === tagSlug)

  if (!tagData) {
    error(404, `Không tìm thấy thẻ "${tagSlug}".`)
  }

  // Prepare tag metadata
  const tagMetadata = {
    title: tagData.name,
    slug: tagData.slug,
    count: tagData.count,
    description: `Có ${tagData.count} bài viết với thẻ "${tagData.name}"`
  }

  try {
    const { posts, pagination } = loadPaginatedPosts(
      url,
      { tag: tagMetadata.title },
      getFilteredPosts
    )

    // Check for page overflow
    if (pagination.currentPage > pagination.totalPages && pagination.totalPages > 0) {
      error(404, `Trang ${pagination.currentPage} không tồn tại trong thẻ "${tagMetadata.title}".`)
    }

    return {
      tag: tagMetadata,
      posts,
      pagination,
      site: siteConfig
    }
  } catch (err) {
    if (isHttpError(err)) throw err
    console.error('Error loading Tag page:', err)
    error(500, 'Không thể tải bài viết theo thẻ này.')
  }
}
