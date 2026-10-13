/**
 * Parse a date value into a valid ISO string.
 * Returns the current date as ISO string if the input is invalid.
 *
 * @param {string | Date | undefined | null} value
 * @returns {string} ISO 8601 date string
 */
export function toISODate(value) {
  try {
    const parsed = new Date(value ?? NaN)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  } catch {
    // fall through to default
  }
  return new Date().toISOString()
}

/**
 * Vietnamese date text built by hand ("15 tháng 8, 2026" / "15 thg 8, 2026").
 *
 * This deliberately avoids `toLocaleDateString('vi-VN', …)`: the first call makes the browser
 * load its locale (ICU) data, which cost ~100 ms of main-thread time on a throttled phone
 * during hydration — the largest single script task on the home page. The output is the same
 * as `Intl` gives for `vi-VN`, and the day/month/year come from the same local-time parts.
 *
 * @param {string | Date | undefined | null} value
 * @param {'long' | 'short'} monthStyle `long` → "tháng 8", `short` → "thg 8"
 * @returns {string} Formatted date, or '' when the value is not a valid date
 */
function formatViDate(value, monthStyle) {
  const parsed = new Date(value ?? NaN)
  if (isNaN(parsed.getTime())) return ''
  const month = monthStyle === 'long' ? 'tháng' : 'thg'
  return `${parsed.getDate()} ${month} ${parsed.getMonth() + 1}, ${parsed.getFullYear()}`
}

/**
 * Format a date for lists and cards (e.g. "15 thg 8, 2026").
 *
 * @param {string | Date | undefined | null} value
 * @returns {string}
 */
export function toDisplayDate(value) {
  return formatViDate(value, 'short')
}

/**
 * Format a date for post headers (e.g. "15 tháng 8, 2026").
 *
 * @param {string | Date | undefined | null} value
 * @returns {string}
 */
export function toLongDisplayDate(value) {
  return formatViDate(value, 'long')
}
