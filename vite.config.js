import { sveltekit } from '@sveltejs/kit/vite'
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import { defineConfig } from 'vite'
import UnoCSS from '@unocss/svelte-scoped/vite'
import mdsvexConfig from './mdsvex.config.js'

const mdsvexExtensions = ['.md', '.svx']

// Preprocessors
/** @type {import('svelte/compiler').PreprocessorGroup} */
const stripSvelteAnnouncer = {
  name: 'strip-svelte-announcer',
  markup: ({ content: code }) => {
    code = code.replace(/<div id="svelte-announcer"[\s\S]*?<\/div>/, '<!---->')
    return { code }
  }
}

/** @type {import('svelte/compiler').PreprocessorGroup} */
const modernizeMdsvexModuleScript = {
  name: 'modernize-mdsvex-module-script',
  markup: ({ content: code, filename }) => {
    if (filename && (filename.endsWith('.md') || filename.endsWith('.svx'))) {
      code = code.replace(/<script\s+context="module">/g, '<script module>')
      code = code.replace(/<script\s+context='module'>/g, '<script module>')
    }
    return { code }
  }
}

/** @type {import('svelte/compiler').PreprocessorGroup} */
const wireTocSnippet = {
  name: 'wire-toc-snippet',
  markup: ({ content: code, filename }) => {
    if (filename && (filename.endsWith('.md') || filename.endsWith('.svx'))) {
      if (code.includes('<slot name="toc">')) {
        code = code.replace(/<slot\s+name="toc"\s*>\s*<\/slot>/, '{@render tocSnippet?.()}')
        code = code.replace(
          '</script>',
          '</script>\n\n<script>\n  let { toc: tocSnippet } = $props()\n</script>'
        )
      }
    }
    return { code }
  }
}

/**
 * UnoCSS svelte-scoped. Its `global-styles` plugin is fully supported on SvelteKit (it swaps the
 * `%unocss-svelte-scoped.global%` placeholder of app.html through the `transform` / `renderChunk`
 * hooks), but it also declares a `transformIndexHtml` hook that is a no-op for SvelteKit
 * (`if (!isSvelteKit)`). SvelteKit 3 does not support that hook and warns about it on every
 * `dev` / `build`. Dropping only that inert hook silences the warning without losing anything.
 * @type {import('vite').PluginOption[]}
 */
const unoPlugins = [UnoCSS()].flat().map((plugin) => {
  if (plugin && 'name' in plugin && plugin.name === 'unocss:svelte-scoped:global-styles') {
    const copy = /** @type {any} */ ({ ...plugin })
    delete copy.transformIndexHtml
    return copy
  }
  return plugin
})

/**
 * Dev only: `server.warmup` pre-transforms files, but the first SSR *request* still has to
 * initialise SvelteKit and evaluate every data module (~2 s). That cost used to land on the
 * first page the developer opened. Requesting the home page once as soon as the server is
 * listening pays it in advance, in the background. Nothing is built or served differently.
 * @type {import('vite').Plugin}
 */
const primeFirstRequest = {
  name: 'prime-first-ssr-request',
  apply: 'serve',
  configureServer(server) {
    server.httpServer?.once('listening', () => {
      const address = server.httpServer?.address()
      if (address && typeof address === 'object') {
        fetch(`http://localhost:${address.port}/`).catch(() => {
          // Only a head start: if the request fails the first real visit simply pays the cost
        })
      }
    })
  }
}

export default defineConfig({
  // Dev only. `pnpm dev` compiles lazily, so the FIRST visit after every start used to pay for
  // everything at once (mdsvex-compiling every markdown file, Svelte + UnoCSS for every
  // component, then the 2 MB CMS bundle on /admin). Both options below make Vite do that work
  // at startup, in the background, before the first request arrives.
  optimizeDeps: {
    // `svelte-seo` is needed by every page; `@sveltia/cms` only by /admin (a dynamic import).
    // Left to be discovered, either one makes Vite re-optimize and force-reload the browser
    // in the middle of the first visit. Pre-bundled once, then served from node_modules/.vite.
    include: ['svelte-seo', '@sveltia/cms']
  },

  server: {
    warmup: {
      clientFiles: ['./src/routes/**/*.svelte', './src/lib/**/*.{svelte,js,md}'],
      ssrFiles: ['./src/routes/**/+*.{js,svelte}', './src/lib/**/*.{svelte,js,md}']
    }
  },

  plugins: [
    primeFirstRequest,
    ...unoPlugins,

    sveltekit({
      // Compiler & Preprocessor options
      extensions: ['.svelte', ...mdsvexExtensions],
      preprocess: [
        stripSvelteAnnouncer,
        mdsvex(/** @type {any} */ (mdsvexConfig)),
        modernizeMdsvexModuleScript,
        wireTocSnippet,
        vitePreprocess()
      ],
      compilerOptions: {
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true
      },

      // KHÔNG bọc trong kit: { ... } nữa mà khai báo trực tiếp ở đây:
      adapter: adapter({
        pages: 'build',
        assets: 'build',
        precompress: false,
        strict: true,
        fallback: '404.html'
      }),
      inlineStyleThreshold: 30720,
      prerender: {
        handleUnseenRoutes: 'ignore',
        crawl: true
      },
      version: {
        pollInterval: 0
      },
      serviceWorker: {
        register: false
      }
    })
  ],

  build: {
    minify: true,
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    modulePreload: false,
    rollupOptions: {
      // `manualChunks` removed: Vite 8 (rolldown) rejects it in the service-worker
      // build; code splitting is left to the bundler.
      treeshake: {
        moduleSideEffects: (id) => {
          if (id.includes('.css') || id.includes('fontsource')) {
            return true
          }
          if (id.includes('node_modules')) {
            return false
          }
          return true
        },
        propertyReadSideEffects: false
      }
    },
    target: ['es2022', 'chrome89', 'safari15', 'firefox89'],
    chunkSizeWarningLimit: 600
  }
})
