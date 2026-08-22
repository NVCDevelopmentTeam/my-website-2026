/**
 * Parse a date value into a valid ISO string.
 * Returns the current date as ISO string if the input is invalid.
 *
 * @param {string | Date | undefined | null} value
 * @returns {string} ISO 8601 date string
 */
export function toISODate(value) {
  try {
    const parsed = new Date(value)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  } catch {
    // fall through to default
  }
  return new Date().toISOString()
}

/**
 * Format a date string or Date object to Vietnamese display format.
 *
 * @param {string | Date | undefined | null} value
 * @returns {string} Formatted display date (e.g. "15 tháng 8, 2026")
 */
export function toDisplayDate(value) {
  try {
    const parsed = new Date(value)
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  } catch {
    // fallback
  }
  return ''
}
