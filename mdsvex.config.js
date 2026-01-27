// mdsvex.config.js
import { visit } from 'unist-util-visit'
import remarktoc from 'remark-toc'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkHeadings from '@vcarl/remark-headings'

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

      // Only update if not explicitly set
      if (!fm.description || fm.description.length < 10) {
        fm.description = result.preview
      }

      if (!fm.readingTime) {
        fm.readingTime = result.readingTime
      }

      if (!fm.toc || fm.toc.length === 0) {
        fm.toc = result.toc
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
  const contentNodes = tree.children.filter((node) => node.type !== 'yaml')
  if (contentNodes.length === 0) return { preview: '', toc: [], readingTime: 1, wordsCount: 0 }

  const fullText = contentNodes.map(toString).join(' ')
  const words = fullText.split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(words / 200))
  const preview = fullText.slice(0, 200).trim() + (fullText.length > 200 ? '...' : '')

  const toc = []
  visit(tree, 'heading', (node) => {
    const text = toString(node)
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    toc.push({ level: node.depth, title: text, id })
  })

  return { preview, toc, readingTime, wordsCount: words }
}

const config = {
  extensions: ['.svx', '.md'],
  remarkPlugins: [
    remarkExtractContent,
    remarkHeadings,
    remarktoc,
  ],
  rehypePlugins: [
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: 'wrap' }]
  ]
}

export default config