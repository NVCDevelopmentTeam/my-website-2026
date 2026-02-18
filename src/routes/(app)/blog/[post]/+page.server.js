import { getPostBySlug, getFilteredPosts } from '$lib/data/posts'
import { error } from '@sveltejs/kit'

export const prerender = true

export async function entries() {
  const { posts } = getFilteredPosts({ limit: -1 })
  return posts.map((post) => ({ post: post.slug }))
}

export async function load({ params }) {
  const slugOrRaw = params.post

  try {
    // Get current post
    const entry = getPostBySlug(slugOrRaw)
    const { metadata, rawName, slug } = entry

    // Get all posts using getFilteredPosts (no filter = all posts)
    const { posts: allPosts } = getFilteredPosts({
      offset: 0,
      limit: 9999 // Get all posts
    })

    // Find current post index
    const currentIndex = allPosts.findIndex(
      (p) => p.slug === slug || p.slug === slugOrRaw || p.rawName === rawName
    )

    // Initialize navigation
    let prevPost = null
    let nextPost = null

    // Get previous post (newer - lower index)
    if (currentIndex > 0) {
      const prev = allPosts[currentIndex - 1]
      prevPost = {
        slug: prev.slug,
        title: prev.metadata?.title || prev.rawName,
        excerpt: prev.metadata?.excerpt || '',
        date: prev.metadata?.date
      }
    }

    // Get next post (older - higher index)
    if (currentIndex !== -1 && currentIndex < allPosts.length - 1) {
      const next = allPosts[currentIndex + 1]
      nextPost = {
        slug: next.slug,
        title: next.metadata?.title || next.rawName,
        excerpt: next.metadata?.excerpt || '',
        date: next.metadata?.date
      }
    }

    // Merge prevPost and nextPost into metadata
    return {
      post: {
        slug,
        rawName,
        metadata: {
          ...metadata,
          prevPost,
          nextPost
        }
      }
    }
  } catch (err) {
    if (!err.message?.includes('Invalid slug')) {
      console.error('Error loading post:', err)
    }
    error(404, `Post not found: ${slugOrRaw}`)
  }
}
