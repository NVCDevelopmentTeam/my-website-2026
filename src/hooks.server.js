import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Where SvelteKit leaves the built client assets while it prerenders the pages.
 * (Only read at build time — the deployed site is plain static files.)
 */
const ASSETS_DIR = join(
  process.cwd(),
  '.svelte-kit',
  'output',
  'client',
  '_app',
  'immutable',
  'assets'
)

/**
 * The <link> that @unocss/svelte-scoped puts in place of `%unocss-svelte-scoped.global%`
 * (see app.html): a render-blocking stylesheet request on every page, answered only after
 * the document itself, and the fonts behind it could not even start before it arrived.
 * Kit already inlines the rest of the CSS (`inlineStyleThreshold`), so this one is inlined
 * the same way: ~18 KB raw / ~3 KB compressed, in exchange for one round trip on the
 * critical path of the first paint. In `dev` the plugin injects the styles itself and this
 * link does not exist, so nothing happens.
 */
const GLOBAL_STYLES_LINK =
  /<link href="[^"]*?(unocss-svelte-scoped-global\.[\w-]+\.css)" rel="stylesheet"\s*\/?>/

/** @type {Map<string, string>} */
const inlined = new Map()

/** @param {string} file */
function readGlobalStyles(file) {
  let css = inlined.get(file)
  if (css === undefined) {
    css = readFileSync(join(ASSETS_DIR, file), 'utf-8')
    inlined.set(file, css)
  }
  return css
}

/** @type {import('@sveltejs/kit/hooks').Handle} */
export async function handle({ event, resolve }) {
  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace(GLOBAL_STYLES_LINK, (link, file) => {
        try {
          return `<style>${readGlobalStyles(file)}</style>`
        } catch {
          return link // asset not found: keep the normal stylesheet link
        }
      })
  })
}
