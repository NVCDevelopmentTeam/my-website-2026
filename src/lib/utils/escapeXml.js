/**
 * Escape XML special characters to prevent feed/sitemap corruption.
 *
 * @param {string | null | undefined} text
 * @returns {string}
 */
export function escapeXml(text) {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
