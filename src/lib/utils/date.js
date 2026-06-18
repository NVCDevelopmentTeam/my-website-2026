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
