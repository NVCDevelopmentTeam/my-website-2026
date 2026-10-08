import { error } from '@sveltejs/kit'

const postModules = import.meta.glob('#lib/contents/posts/*.md')

export async function load({ data }) {
  const { slug, rawName, metadata } = data.post

  // The markdown file is always located by its file name (rawName). `slug` comes from
  // frontmatter / slugify() and can differ from the file name (case, diacritics, custom slug).
  const fileToImport = rawName ?? slug

  const match = Object.entries(postModules).find(([path]) => path.endsWith(`/${fileToImport}.md`))

  if (!match) {
    error(404, `Post content not found: ${fileToImport}`)
  }

  const [, resolver] = match
  const postModule = /** @type {{ default: any }} */ (await resolver())

  return {
    content: postModule.default,
    metadata,
    layout: {
      fullWidth: true
    }
  }
}
