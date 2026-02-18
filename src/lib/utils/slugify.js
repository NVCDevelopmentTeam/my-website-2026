/**
 * Vietnamese-friendly slugify function (WordPress-style)
 * @param {string} text - The text to slugify
 * @returns {string} - The slugified text
 */
export function slugify(text) {
  if (!text) return ''

  return text
    .toString()
    .normalize('NFD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove all non-alphanumeric, non-space, non-hyphen characters
    .replace(/[\s_]+/g, '-') // replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // replace multiple hyphens with a single one
    .replace(/^-+|-+$/g, '') // remove hyphens from both ends
}
