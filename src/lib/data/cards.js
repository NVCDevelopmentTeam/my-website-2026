/**
 * What a post card shows (sidebar, home page, lists). Everything else of a post, above all its
 * table of contents, stays out of the data that is sent to the browser with every page.
 * @param {any} post
 */
export const toCard = ({ slug, metadata: m }) => ({
  slug,
  metadata: {
    slug: m.slug,
    title: m.title,
    author: m.author,
    date: m.date,
    categories: m.categories,
    tags: m.tags,
    description: m.description,
    preview: m.preview,
    readingTime: m.readingTime,
    image: m.image
  }
})
