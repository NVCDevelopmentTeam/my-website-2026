// mdsvex.config.js — mdsvex 1.0 (Vite plugin; remark/rehype were replaced by parse plugins)
import { migrate } from '@mdsvex/migrate'
import { toc } from '@mdsvex/plugin-toc'
import { anchors } from '@mdsvex/plugin-anchors'
import { external_links } from '@mdsvex/plugin-external-links'
import { slugify } from './src/lib/utils/slugify.js'
import { truncate } from './src/lib/utils/truncate.js'

/* -----------------------------------------------------
   Local plugin "site" (replaces remarkExtractContent, rehypeInsertTocSlot, rehypeLazyLoadImages)
   - summary: description / reading time / word count, written to plugin_data.site.summary
   - toc_slot: wraps everything from the first heading on, so the ToC renders between the intro
     and that heading (see src/lib/components/TocSlot.svelte)
   - images: every image except the first one is lazy (the first one may be the LCP)
----------------------------------------------------- */
/** Node types that are not body copy */
const NON_BODY = new Set(['frontmatter', 'heading', 'html_comment', 'definition'])

/** Tags that never belong in a post (old remarkSafeContent list) */
const DANGEROUS_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'])

/**
 * Vite `pre` plugin. Documents stay plain CommonMark on disk (that is what Sveltia CMS writes),
 * and are converted to mdsvex 1.0's PFM when they are compiled: in PFM `*x*` is bold and `_x_` is
 * italic, so a raw `**x**` would render as a nested <strong>.
 *
 * Then curly braces in prose are text, never Svelte expressions or blocks. A stray
 * `{` typed in the CMS would otherwise throw while prerendering and break the whole build.
 * Code fences and inline code are left alone (mdsvex already escapes them).
 * @type {import('vite').Plugin}
 */
export const prepareMarkdown = {
  name: 'commonmark-to-pfm-and-escape-braces',
  enforce: 'pre',
  transform(code, id) {
    if (!/\.(md|svx)$/.test(id.split('?')[0])) return null

    let fence = ''
    code = migrate(code)
    let frontmatter = false
    const lines = code.split('\n').map((line, i) => {
      if (i === 0 && line.trim() === '---') return ((frontmatter = true), line)
      if (frontmatter) return ((frontmatter = line.trim() !== '---'), line)

      const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1]
      if (fence) {
        if (marker && marker[0] === fence[0] && marker.length >= fence.length) fence = ''
        return line
      }
      if (marker) return ((fence = marker), line)

      // even parts are prose, odd parts are inline code spans
      return line
        .split(/(`+[^`]*`+)/)
        .map((part, n) =>
          n % 2 ? part : part.replace(/(?<!\\)\{/g, '&#123;').replace(/(?<!\\)\}/g, '&#125;')
        )
        .join('')
    })

    return { code: lines.join('\n'), map: null }
  }
}

/** @type {import('mdsvex').Bundle} */
const site = {
  name: 'site',
  module: '#lib/components/markdown.js',
  directives: { toc_slot: {} },
  parse: {
    name: 'site',

    heading: {
      parse(node, ctx) {
        const scratch = /** @type {Record<string, any>} */ (ctx.scratch)
        if (scratch.tocSlot || node.parent?.type !== 'root') return
        // A table of contents belongs to posts only; pages (about, contact, …) never get one
        if (!ctx.filename?.replace(/\\/g, '/').includes('/contents/posts/')) return

        scratch.tocSlot = true
        // A heading that opens the document has no intro to put the ToC after
        if (node.prev) node.wrap_from('directive_container', { name: 'toc_slot' })
      }
    },

    // A code block that scrolls sideways must be reachable with the keyboard (WCAG 2.1.1)
    code_fence: {
      parse(node) {
        if (!node.attrs.tabindex) node.attrs.tabindex = '0'
      }
    },

    html: {
      parse(node) {
        return () => {
          if (!node.pending && DANGEROUS_TAGS.has(String(node.attrs.tag).toLowerCase()))
            node.remove()
        }
      }
    },

    image: {
      parse(node, ctx) {
        const scratch = /** @type {Record<string, any>} */ (ctx.scratch)
        scratch.images = (scratch.images ?? 0) + 1

        if (scratch.images > 1 && !node.attrs.loading) node.attrs.loading = 'lazy'
        if (!node.attrs.decoding) node.attrs.decoding = 'async'
      }
    },

    document(root, ctx) {
      const blocks = []

      for (let node = root.first_child; node; node = node.next) {
        if (!NON_BODY.has(node.type)) blocks.push(node.text_content)
      }

      const text = blocks.join(' ').replace(/\s+/g, ' ').trim()
      const words = text ? text.split(' ').length : 0
      const excerpt = truncate(text, 160)

      ctx.set('summary', {
        description: excerpt,
        preview: excerpt,
        readingTime: Math.max(1, Math.ceil(words / 200)),
        wordCount: words
      })
    }
  }
}

/** @type {import('mdsvex').MdsvexOptions} */
const config = {
  extensions: ['.svx', '.md'],
  // Vietnamese-aware ids (đ, diacritics); duplicates get -1, -2 …
  highlight: false, // plain <pre><code>, as before: no highlighter, no extra spans or theme CSS
  heading_ids: { slug: (text) => slugify(text) || 'section' },
  plugins: [
    toc({ min_depth: 1, max_depth: 6 }),
    anchors({ position: 'wrap' }),
    external_links({ target: '_blank', rel: ['noopener', 'noreferrer'] }),
    site
  ]
}

export default config
