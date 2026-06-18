/**
 * Parse a value that may be a comma-separated string or an array into a
 * deduplicated, trimmed array of non-empty strings.
 *
 * @param {string | string[] | undefined | null} value
 * @param {string} [fallback] - Value to use when the result is empty.
 * @returns {string[]}
 */
export function parseList(value, fallback) {
  let items = []

  if (typeof value === 'string') {
    items = value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  } else if (Array.isArray(value)) {
    items = value.filter(Boolean)
  }

  if (items.length === 0 && fallback) {
    items = [fallback]
  }

  return items
}
