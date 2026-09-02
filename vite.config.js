import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import UnoCSS from '@unocss/svelte-scoped/vite'
import { compression } from 'vite-plugin-compression2'
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'

const mdsvexExtensions = ['.md', '.svx']

// Preprocessor that strips the svelte-announcer element (Svelte 5 runes safe)
const stripSvelteAnnouncer = {
  name: 'strip-svelte-announcer',
  markup: ({ content: code }) => {
    code = code.replace(/<div id="svelte-announcer"[\s\S]*?<\/div>/, '<!---->')
    return { code }
  }
}

// Preprocessor converting mdsvex generated `context="module"` to `module` attribute for Svelte 5
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

export default defineConfig({
  plugins: [
    // UnoCSS svelte-scoped: places each component's utility CSS directly in
    // that component's own <style> block instead of one global stylesheet.
    // Must come before sveltekit() (it's a preprocessor).
    UnoCSS(),
    // As of @sveltejs/kit >= 2.62.0, `kit` config (adapter, prerender,
    // version, inlineStyleThreshold, etc.) is passed DIRECTLY at the same
    // level as vite-plugin-svelte's own options (extensions, preprocess,
    // compilerOptions) — NOT nested under a `kit: {...}` object like in
    // svelte.config.js. When configured this way, svelte.config.js (if it
    // still exists) is ignored entirely.
    sveltekit({
      extensions: ['.svelte', ...mdsvexExtensions],
      preprocess: [
        stripSvelteAnnouncer,
        mdsvex(mdsvexConfig),
        modernizeMdsvexModuleScript,
        vitePreprocess()
      ],

      // Force runes mode for the whole project, except libraries in node_modules
      // (this condition can be dropped once on Svelte 6, where runes are default).
      compilerOptions: {
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true
      },

      // --- the options below used to be mistakenly nested under `kit: {}` ---
      adapter: adapter({
        pages: 'build',
        assets: 'build',
        precompress: true, // Auto-generates optimized .gz and .br files for static routes
        strict: true,
        fallback: '404.html'
      }),
      inlineStyleThreshold: 30720, // Inline CSS under 30KB to reduce blocking requests
      prerender: {
        handleUnseenRoutes: 'ignore',
        crawl: true
      },
      version: {
        pollInterval: 0
      }
    }),
    // Merge gzip + brotli into ONE plugin call instead of two separate instances —
    // the singular `algorithm` API of vite-plugin-compression2 is the old syntax,
    // the current version uses `algorithms` (an array).
    compression({
      algorithms: ['brotliCompress', 'gzip'],
      threshold: 1024
    })
  ],

  build: {
    minify: true,
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    modulePreload: {
      polyfill: false
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Sveltia CMS + Appwrite are already loaded via a dynamic import()
          // in the /admin route (see routes/admin/+page.svelte), so Rollup's
          // default automatic chunking already isolates them into their own
          // lazy chunk without any help here.
          //
          // ⚠️ Do NOT force '@sveltia' into a manually-named chunk (previously
          // `if (id.includes('@sveltia')) return 'cms'`). Naming a chunk
          // manually turns it into a fixed merge point: Rollup then also uses
          // that same chunk to host the Svelte runtime helpers shared between
          // the CMS bundle and the rest of the app, which made the app-wide
          // runtime chunk (loaded on every single page, including the
          // homepage) statically import the ~2MB CMS/Appwrite bundle. Removing
          // the manual pin fixes that — verified via `.vite/manifest.json`:
          // the shared runtime chunk no longer imports the CMS chunk.
          if (
            id.includes('mdsvex') ||
            id.includes('unified') ||
            id.includes('remark') ||
            id.includes('rehype')
          )
            return 'markdown'

          // ⚠️ REMOVED: No longer manually splitting `@sveltejs/kit` and
          // `/svelte/` runtime into their own chunk. Manually splitting
          // Svelte/SvelteKit core easily causes hydration errors and breaks
          // SvelteKit's automatic code-splitting / waterfall-prevention
          // mechanism.
        }
      },
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
    target: ['es2020', 'chrome80', 'safari14', 'firefox78'],
    chunkSizeWarningLimit: 600
  }
})
