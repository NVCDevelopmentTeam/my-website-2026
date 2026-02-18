// mdsvex.config.js
import { visit } from 'unist-util-visit'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkHeadings from '@vcarl/remark-headings'
import { slugify } from './src/lib/utils/slugify.js'
import { truncate } from './src/lib/utils/truncate.js'

/* -----------------------------------------------------
   🧩 Helper: Get raw text from node
----------------------------------------------------- */
function toString(node) {
  if (node.type === 'text') return node.value || ''
  if (node.children) return node.children.map(toString).join('')
  return ''
}

/* -----------------------------------------------------
   🧩 Remark Plugin - Auto Extract Content
----------------------------------------------------- */
function remarkExtractContent() {
  return function transformer(tree, file) {
    try {
      if (!file.data.fm) {
        file.data.fm = {}
      }

      const fm = file.data.fm
      const result = extractMetadata(tree)

      // Only update if not explicitly set or too short
      if (!fm.description || fm.description.length < 10) {
        fm.description = result.description
      }

      if (!fm.preview || fm.preview.length < 10) {
        fm.preview = result.preview
      }

      if (!fm.readingTime) {
        fm.readingTime = result.readingTime
      }

      if (process.env.NODE_ENV === 'development') {
        fm._wordsCount = result.wordsCount
      }
    } catch (err) {
      console.error('[remarkExtractContent] Error:', err)
    }
  }
}

function extractMetadata(tree) {
  const contentNodes = tree.children.filter(
    (node) => node.type !== 'yaml' && node.type !== 'heading'
  )
  if (contentNodes.length === 0)
    return { description: '', preview: '', readingTime: 1, wordsCount: 0 }

  // Get text content, excluding headings for a better summary
  const fullText = contentNodes.map(toString).join(' ')
  const cleanText = fullText.replace(/\s+/g, ' ').trim()

  const words = cleanText.split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(words / 200))

  // Description: ~150-160 chars for SEO - respects word boundaries
  const description = truncate(cleanText, 160)

  // Preview: ~160 chars for listings (approx 2 lines) - respects word boundaries
  const preview = truncate(cleanText, 160)

  return { description, preview, readingTime, wordsCount: words }
}

/* -----------------------------------------------------
   🎯 Remark Plugin - Custom Slug with Vietnamese Support
----------------------------------------------------- */
function remarkSlug() {
  return function transformer(tree) {
    const usedSlugs = new Map()

    visit(tree, 'heading', (node) => {
      const text = toString(node)
      let slug = slugify(text)

      // Handle duplicate slugs
      if (usedSlugs.has(slug)) {
        const count = usedSlugs.get(slug)
        usedSlugs.set(slug, count + 1)
        slug = `${slug}-${count}`
      } else {
        usedSlugs.set(slug, 1)
      }

      if (!node.data) node.data = {}
      if (!node.data.hProperties) node.data.hProperties = {}

      // Set ID for both the remark node and the resulting HTML element
      node.data.id = slug
      node.data.hProperties.id = slug
    })
  }
}

/* -----------------------------------------------------
   🧩 Rehype Plugin - Lazy Load Images (excluding first image)
----------------------------------------------------- */
function rehypeLazyLoadImages() {
  return function transformer(tree) {
    let imgCount = 0
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        imgCount++
        if (!node.properties) {
          node.properties = {}
        }

        // Only add loading="lazy" for images after the first one
        // to avoid delaying LCP if the first image is above the fold
        if (imgCount > 1 && !node.properties.loading) {
          node.properties.loading = 'lazy'
        }

        // Use async decoding to prevent main thread blocking
        if (!node.properties.decoding) {
          node.properties.decoding = 'async'
        }
      }
    })
  }
}

/* -----------------------------------------------------
   🧩 Rehype Plugin - Extract TOC
----------------------------------------------------- */
function rehypeExtractToc() {
  return function transformer(tree, file) {
    const toc = []

    visit(tree, 'element', (node) => {
      if (/^h[1-6]$/.test(node.tagName)) {
        // Use existing ID or generate one
        const id = node.properties?.id || slugify(toString(node))
        const title = toString(node)

        if (id && title) {
          toc.push({
            level: parseInt(node.tagName.slice(1)),
            title,
            id
          })
        }
      }
    })

    if (!file.data.fm) {
      file.data.fm = {}
    }

    // Only set if not explicitly defined in frontmatter
    if (!file.data.fm.toc || file.data.fm.toc.length === 0) {
      file.data.fm.toc = toc
    }
  }
}

/* -----------------------------------------------------
   🧩 Rehype Plugin - Secure External Links
----------------------------------------------------- */
function rehypeExternalLinks() {
  return function transformer(tree) {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties && typeof node.properties.href === 'string') {
        const href = node.properties.href
        if (href.startsWith('http')) {
          node.properties.target = '_blank'
          node.properties.rel = 'noopener noreferrer'
        }
      }
    })
  }
}

const config = {
  extensions: ['.svx', '.md'],
  remarkPlugins: [remarkExtractContent, remarkSlug, remarkHeadings],
  rehypePlugins: [
    rehypeExtractToc,
    [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    rehypeLazyLoadImages,
    rehypeExternalLinks
  ]
}

export default config
