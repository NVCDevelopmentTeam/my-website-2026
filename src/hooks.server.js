import { readFileSync, readdirSync } from 'node:fs'
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

/**
 * What the browser needs besides the page itself, but SvelteKit does not announce.
 *
 * While it hydrates a page, SvelteKit's client waits for two things it never lists in the
 * page's <head>:
 *   1. the `+error.svelte` components of the route (it builds the error boundaries first:
 *      "TODO load earlier?" in its source), and
 *   2. the markdown file of the page or post, which the route's `+page.js` loads with `import()`.
 * Both were fetched only after the page's own code had arrived, one request after the other,
 * plus their CSS: about three round trips before the page became interactive. Here they are
 * announced in the <head> so that they travel with everything else.
 *
 * Read from the client build while prerendering. If those files are not there (`dev`) or have a
 * shape this code does not know, nothing is added and everything still works.
 */
const CLIENT_DIR = join(process.cwd(), '.svelte-kit', 'output', 'client')

/**
 * @typedef {{ file: string, imports?: string[], dynamicImports?: string[], css?: string[], src?: string }} ManifestEntry
 * @type {{ manifest: Record<string, ManifestEntry>, routes: Record<string, any[]> } | null | undefined}
 */
let build

function readBuild() {
  if (build !== undefined) return build

  try {
    const manifest = JSON.parse(readFileSync(join(CLIENT_DIR, '.vite', 'manifest.json'), 'utf-8'))
    const entryDir = join(CLIENT_DIR, '_app', 'immutable', 'entry')
    const appFile = readdirSync(entryDir).find((name) => /^app\.[\w-]+\.js$/.test(name))
    const app = readFileSync(join(entryDir, appFile ?? ''), 'utf-8')
    // The route table of the client: { '/(app)': [leaf, [layouts], [error pages]], … }
    const routes = JSON.parse(/,i=(\{.*?\}),a=\{/.exec(app)?.[1] ?? '{}')

    build = { manifest, routes }
  } catch {
    build = null
  }

  return build
}

/**
 * The files of a module and of what it imports, and the CSS of all of them.
 * @param {Record<string, ManifestEntry>} manifest
 * @param {string | undefined} key
 * @param {{ js: Set<string>, css: Set<string> }} out
 * @param {boolean} [withDynamic] also the modules it loads with import() (one level only)
 */
function collect(manifest, key, out, withDynamic = false) {
  const entry = key ? manifest[key] : undefined
  if (!entry || out.js.has(entry.file)) return

  out.js.add(entry.file)
  for (const css of entry.css ?? []) out.css.add(css)
  for (const dep of entry.imports ?? []) collect(manifest, dep, out)
  if (withDynamic) for (const dep of entry.dynamicImports ?? []) collect(manifest, dep, out)
}

/**
 * <link>s for what hydrating this route needs beyond the page's own modules.
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {string} html a chunk of the page that contains the <head> links of SvelteKit
 */
function hydrationLinks({ route, params }, html) {
  const data = readBuild()
  const base = /(?:href|src)="((?:\.{1,2}\/)*|\/)_app\/immutable\//.exec(html)?.[1]
  if (!data || base === undefined || !route.id) return ''

  const { manifest, routes } = data
  const out = { js: new Set(), css: new Set() }
  const keys = Object.keys(manifest)

  // 1. The error pages: the root `+error.svelte` is always node 1, the rest comes from the route
  const nodeIds = new Set([1, ...(routes[route.id]?.[2] ?? [])])
  for (const key of keys) {
    const id = /\/nodes\/(\d+)\.js$/.exec(key)?.[1]
    if (id !== undefined && nodeIds.has(Number(id))) collect(manifest, key, out, true)
  }

  // 2. The markdown file of the page or post (named like the page / slug of the URL)
  const name = route.id === '/(app)' ? 'index' : (params.page ?? params.post)
  if (name) {
    const wanted = route.id.endsWith('[post]') ? '/contents/posts/' : '/contents/pages/'
    for (const key of keys) {
      if (key.endsWith(`${wanted}${name}.md`)) {
        collect(manifest, key, out)
      }
    }
  }

  let links = ''
  for (const file of out.js) links += `<link rel="modulepreload" href="${base}${file}">`
  // `crossorigin` like the stylesheet links Vite adds itself: without it the browser would not
  // reuse the preloaded file and fetch it a second time
  for (const css of out.css)
    links += `<link rel="preload" as="style" crossorigin href="${base}${css}">`

  return links
}

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
      html
        .replace('</head>', (end) => hydrationLinks(event, html) + end)
        .replace(GLOBAL_STYLES_LINK, (link, file) => {
          try {
            return `<style>${readGlobalStyles(file)}</style>`
          } catch {
            return link // asset not found: keep the normal stylesheet link
          }
        })
  })
}
