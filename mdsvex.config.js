// mdsvex.config.js
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkHeadings from '@vcarl/remark-headings'

/* -----------------------------------------------------
   🧩 Remark Plugin - Auto Extract Content
   Extracts description, TOC, reading time from markdown
----------------------------------------------------- */
function remarkExtractContent() {
  return function transformer(tree, file) {
    try {
      // Initialize frontmatter
      if (!file.data.fm) {
        file.data.fm = {}
      }

      const fm = file.data.fm

      // Skip if description already exists (manual override)
      if (
        fm.description &&
        typeof fm.description === 'string' &&
        fm.description.trim().length > 15 &&
        !fm.description.startsWith('title:') &&
        !fm.description.startsWith('---')
      ) {
        // Still extract TOC and reading time even if description exists
        const result = extractMetadata(tree)

        if (!fm.readingTime) {
          fm.readingTime = result.readingTime
        }

        if (!fm.toc || fm.toc.length === 0) {
          fm.toc = result.toc
        }

        if (process.env.NODE_ENV === 'development') {
          fm._contentLength = result.contentLength
          fm._wordsCount = result.wordsCount
        }

        return
      }

      // Extract all metadata
      const result = extractMetadata(tree)

      // Build updates
      const updates = {}

      if (!fm.description && result.preview) {
        updates.description = result.preview
      }

      if (!fm.readingTime) {
        updates.readingTime = result.readingTime
      }

      if (!fm.toc || fm.toc.length === 0) {
        updates.toc = result.toc
      }

      // Add debug fields (only in development)
      if (process.env.NODE_ENV === 'development') {
        updates._contentLength = result.contentLength
        updates._wordsCount = result.wordsCount
      }

      // Merge with existing frontmatter
      file.data.fm = {
        ...fm,
        ...updates
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[remarkExtractContent] Error:', err)
      }
    }
  }
}

/* -----------------------------------------------------
   🧩 Helper: Extract all metadata from markdown tree
----------------------------------------------------- */
function extractMetadata(tree) {
  // Filter out YAML frontmatter nodes
  const contentNodes = tree.children.filter((node) => node.type !== 'yaml')

  if (contentNodes.length === 0) {
    return {
      preview: null,
      toc: [],
      readingTime: 1,
      contentLength: 0,
      wordsCount: 0
    }
  }

  const contentTree = { type: 'root', children: contentNodes }
  const fullText = toString(contentTree)

  if (!fullText || fullText.trim().length === 0) {
    return {
      preview: null,
      toc: [],
      readingTime: 1,
      contentLength: 0,
      wordsCount: 0
    }
  }

  // Generate smart preview (220 chars, sentence-aware)
  const preview = smartTruncate(fullText, 220)

  // Calculate reading time (200 words per minute)
  const words = fullText.split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(words / 200))

  // Extract headings for Table of Contents
  const toc = []
  visit(tree, 'heading', (node) => {
    if (node.depth >= 1 && node.depth <= 6) {
      const text = toString(node)
      const id = slugify(text)
      toc.push({
        level: node.depth,
        title: text,
        id
      })
    }
  })

  return {
    preview,
    toc,
    readingTime,
    contentLength: fullText.length,
    wordsCount: words
  }
}

/* -----------------------------------------------------
   🧩 Helper: Slugify text (Vietnamese-friendly)
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

/* -----------------------------------------------------
   🧩 Helper: Smart truncate (sentence-aware)
----------------------------------------------------- */
function smartTruncate(text, max = 220) {
  if (!text || text.length <= max) return text
  const cut = text.slice(0, max)

  // Try to find sentence boundary
  const punct = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('?'), cut.lastIndexOf('!'))

  // If punctuation found near end (> 50% of max length)
  if (punct > max * 0.5) {
    return text.slice(0, punct + 1).trim()
  }

  // Fall back to word boundary
  const lastSpace = cut.lastIndexOf(' ')
  const cutPoint = lastSpace > 20 ? lastSpace : max
  return text.slice(0, cutPoint).trim() + '…'
}

/* -----------------------------------------------------
   🧩 Mdsvex Configuration Export
----------------------------------------------------- */
const config = {
  extensions: ['.svx', '.md'],

  remarkPlugins: [
    remarkExtractContent, // Auto-generate description, TOC, readingTime
    remarkHeadings // Extract headings metadata
  ],

  rehypePlugins: [
    rehypeSlug, // Add IDs to headings
    [
      rehypeAutolinkHeadings, // Wrap headings in anchors
      {
        behavior: 'wrap'
      }
    ]
  ]
}

export default config
