/**
 * Truncates text to a specified length without cutting in the middle of a word.
 * Prioritizes ending at a sentence terminator (., ?, !) if available near the end.
 *
 * @param {string} text - The text to truncate.
 * @param {number} length - The maximum length of the truncated text.
 * @param {string} [suffix='...'] - The suffix to append if truncated.
 * @returns {string} - The truncated text.
 */
export function truncate(text, length, suffix = '...') {
  if (!text || text.length <= length) {
    return text
  }

  // Initial cut
  let truncated = text.substring(0, length)

  // 1. Try to find a sentence terminator in the last 20% of the allowed length
  // This helps end the preview more naturally
  const searchBuffer = Math.floor(length * 0.2)
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  )

  if (lastSentenceEnd > length - searchBuffer) {
    return truncated.substring(0, lastSentenceEnd + 1)
  }

  // 2. If no sentence end found, find the last whitespace
  const lastSpaceIndex = truncated.lastIndexOf(' ')

  if (lastSpaceIndex === -1) {
    return truncated + suffix
  }

  return truncated.slice(0, lastSpaceIndex).trim() + suffix
}
