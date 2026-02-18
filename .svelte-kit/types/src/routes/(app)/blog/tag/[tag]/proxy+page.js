// @ts-nocheck
import { getFilteredPosts, getAllTags } from '$lib/data/posts'
import { siteConfig } from '$lib/config'
import { error } from '@sveltejs/kit'
import { building } from '$app/environment'

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

/** @param {Parameters<import('./$types').PageLoad>[0]} event */
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

  // Current page - avoid accessing during prerender
  const pageParam = building ? null : url.searchParams.get('page')
  const currentPage =
    pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0 ? Number(pageParam) : 1

  const perPage = siteConfig.pagination.postsPerPage
  const offset = (currentPage - 1) * perPage

  try {
    // Get filtered posts by tag name (posts store tag names)
    const { posts, total, totalPages } = getFilteredPosts({
      offset,
      limit: perPage,
      tag: tagMetadata.title
    })

    // Check for page overflow
    if (currentPage > totalPages && totalPages > 0) {
      error(404, `Trang ${currentPage} không tồn tại trong thẻ "${tagMetadata.title}".`)
    }

    return {
      tag: tagMetadata,
      posts,
      pagination: {
        currentPage,
        totalPages,
        totalPosts: total,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages
      },
      site: siteConfig
    }
  } catch (err) {
    console.error('Error loading Tag page:', err)
    error(500, 'Không thể tải bài viết theo thẻ này.')
  }
}
