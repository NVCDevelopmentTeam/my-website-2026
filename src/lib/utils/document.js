/**
 * Read a markdown document imported with `?data` (mdsvex 1.0: parsed, not rendered).
 *
 * `metadata` is the frontmatter; `plugin_data` is what the plugins of mdsvex.config.js found in
 * the body: `site.summary` (description / preview / reading time / word count) and `toc.headings`.
 * Frontmatter always wins; the generated values only fill what the author left empty.
 *
 * @param {{ metadata?: Record<string, any>, plugin_data?: Record<string, any> } | undefined} mod
 * @returns {Record<string, any>}
 */
export function readDocument(mod) {
  const meta = { ...(mod?.metadata ?? {}) }
  const summary = mod?.plugin_data?.site?.summary ?? {}
  const headings = /** @type {{ depth: number, id: string, text: string }[]} */ (
    mod?.plugin_data?.toc?.headings ?? []
  )

  if (typeof meta.description !== 'string' || meta.description.length < 10) {
    meta.description = summary.description ?? ''
  }
  if (typeof meta.preview !== 'string' || meta.preview.length < 10) {
    meta.preview = summary.preview ?? ''
  }
  if (!meta.readingTime) meta.readingTime = summary.readingTime
  meta.wordCount = summary.wordCount ?? 0
  meta.toc = headings.map(({ depth, id, text }) => ({ level: depth, id, title: text }))

  return meta
}
