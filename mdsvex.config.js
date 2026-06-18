import { visit } from 'unist-util-visit'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkHeadings from '@vcarl/remark-headings'
import { slugify } from './src/lib/utils/slugify.js'
import { truncate } from './src/lib/utils/truncate.js'

/* Get raw text from an AST node */
function toString(node) {
  if (node.type === 'text') return node.value || ''
  if (node.children) return node.children.map(toString).join('')
  return ''
}

/* Remark plugin: auto-extract description, preview, and reading time */
function remarkExtractContent() {
  return function transformer(tree, file) {
    try {
      if (!file.data.fm) {
        file.data.fm = {}
      }

      var fm = file.data.fm
      var result = extractMetadata(tree)

      if (!fm.description || fm.description.length < 10) {
        fm.description = result.description
      }

      if (!fm.preview || fm.preview.length < 10) {
        fm.preview = result.preview
      }

      if (!fm.readingTime) {
        fm.readingTime = result.readingTime
      }

      fm._wordsCount = result.wordsCount
    } catch (err) {
      console.error('[remarkExtractContent] Error:', err)
    }
  }
}

function extractMetadata(tree) {
  var contentNodes = tree.children.filter(function (node) {
    return node.type !== 'yaml' && node.type !== 'heading'
  })
  if (contentNodes.length === 0) {
    return { description: '', preview: '', readingTime: 1, wordsCount: 0 }
  }

  var fullText = contentNodes.map(toString).join(' ')
  var cleanText = fullText.replace(/\s+/g, ' ').trim()

  var words = cleanText.split(/\s+/).filter(Boolean).length
  var readingTime = Math.max(1, Math.ceil(words / 200))

  // SEO description: ~150-160 chars
  var description = truncate(cleanText, 160)

  // Preview: ~160 chars for listings
  var preview = truncate(cleanText, 160)

  return { description, preview, readingTime, wordsCount: words }
}

/* Remark plugin: generate heading slugs with Vietnamese support */
function remarkSlug() {
  return function transformer(tree) {
    var usedSlugs = new Map()

    visit(tree, 'heading', function (node) {
      var text = toString(node)
      var slug = slugify(text)

      if (usedSlugs.has(slug)) {
        var count = usedSlugs.get(slug)
        usedSlugs.set(slug, count + 1)
        slug = slug + '-' + count
      } else {
        usedSlugs.set(slug, 1)
      }

      if (!node.data) node.data = {}
      if (!node.data.hProperties) node.data.hProperties = {}

      node.data.id = slug
      node.data.hProperties.id = slug
    })
  }
}

/* Rehype plugin: lazy-load images (skip first for LCP) */
function rehypeLazyLoadImages() {
  return function transformer(tree) {
    var imgCount = 0
    visit(tree, 'element', function (node) {
      if (node.tagName === 'img') {
        imgCount++
        if (!node.properties) {
          node.properties = {}
        }

        // Only lazy-load images after the first one (preserve LCP)
        if (imgCount > 1 && !node.properties.loading) {
          node.properties.loading = 'lazy'
        }

        if (!node.properties.decoding) {
          node.properties.decoding = 'async'
        }
      }
    })
  }
}

/* Rehype plugin: extract table of contents from headings */
function rehypeExtractToc() {
  return function transformer(tree, file) {
    var toc = []

    visit(tree, 'element', function (node) {
      if (/^h[1-6]$/.test(node.tagName)) {
        var id = node.properties?.id || slugify(toString(node))
        var title = toString(node)

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

    if (!file.data.fm.toc || file.data.fm.toc.length === 0) {
      file.data.fm.toc = toc
    }
  }
}

/* Rehype plugin: add security attributes to external links */
function rehypeExternalLinks() {
  return function transformer(tree) {
    visit(tree, 'element', function (node) {
      if (node.tagName === 'a' && node.properties && typeof node.properties.href === 'string') {
        if (node.properties.href.startsWith('http')) {
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
