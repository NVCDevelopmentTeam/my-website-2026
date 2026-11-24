// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite'
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import { defineConfig } from 'vite'
import UnoCSS from '@unocss/svelte-scoped/vite'
import mdsvexConfig, { prepareMarkdown } from './mdsvex.config.js'

/**
 * Strip the legacy Svelte announcer node if present in markup.
 * @type {import('svelte/compiler').PreprocessorGroup}
 */
const stripSvelteAnnouncer = {
  name: 'strip-svelte-announcer',
  markup: ({ content: code }) => {
    const updated = code.replace(/<div id="svelte-announcer"[\s\S]*?<\/div>/, '<!---->')
    return { code: updated }
  }
}

/**
 * UnoCSS svelte-scoped declares a `transformIndexHtml` hook that is a no-op under SvelteKit
 * and can emit warnings in newer SvelteKit versions. Remove that hook while keeping all
 * active styles and transforms intact.
 * @type {import('vite').PluginOption[]}
 */
const unoPlugins = [UnoCSS()].flat().map((plugin) => {
  if (
    plugin &&
    typeof plugin === 'object' &&
    'name' in plugin &&
    plugin.name === 'unocss:svelte-scoped:global-styles'
  ) {
    const copy = /** @type {any} */ ({ ...plugin })
    delete copy.transformIndexHtml
    return copy
  }
  return plugin
})

/**
 * Development helper: warm up the root SSR route once the dev server starts listening
 * so the first browser request does not pay initial cold-start overhead alone.
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
          // Ignore background warm-up errors; normal requests will still render
        })
      }
    })
  }
}

export default defineConfig({
  // Pre-bundle common dependencies upfront to avoid mid-session re-optimization reloads
  optimizeDeps: {
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
    // mdsvex 1.0 is a Vite plugin and has to come before sveltekit()
    prepareMarkdown,
    mdsvex(mdsvexConfig),
    ...unoPlugins,

    sveltekit({
      preprocess: [stripSvelteAnnouncer, vitePreprocess()],
      compilerOptions: {
        // Enable Svelte 5 runes for project files while leaving third-party packages untouched
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true
      },

      // Top-level SvelteKit options inside sveltekit() plugin config
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
      }
    })
  ],

  build: {
    minify: true,
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    // SvelteKit emits its own modulepreload tags, so skip Vite's duplicate helper
    modulePreload: false,
    target: ['es2022', 'chrome89', 'safari15', 'firefox89'],
    chunkSizeWarningLimit: 600
  }
})
