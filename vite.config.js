import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import UnoCSS from '@unocss/svelte-scoped/vite'
import { compression } from 'vite-plugin-compression2'
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'

const mdsvexExtensions = ['.md', '.svx']

// Preprocessor that strips the svelte-announcer element (Svelte 5 runes compatible)
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
    // UnoCSS svelte-scoped: injects utility CSS directly into component <style> blocks.
    // Must be placed before sveltekit() as it acts as a preprocessor.
    UnoCSS(),

    // SvelteKit 2 configuration (passing kit options inline into sveltekit plugin)
    sveltekit({
      extensions: ['.svelte', ...mdsvexExtensions],
      preprocess: [
        stripSvelteAnnouncer,
        mdsvex(mdsvexConfig),
        modernizeMdsvexModuleScript,
        vitePreprocess()
      ],

      // Enforce Svelte 5 Runes mode for application files while skipping node_modules
      compilerOptions: {
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true
      },

      // Static Adapter configuration for production static site deployment
      adapter: adapter({
        pages: 'build',
        assets: 'build',
        precompress: true, // Auto-generates static .gz and .br assets
        strict: true,
        fallback: '404.html'
      }),
      inlineStyleThreshold: 30720, // Inline critical CSS under 30KB to reduce render-blocking requests
      prerender: {
        handleUnseenRoutes: 'ignore',
        crawl: true
      },
      version: {
        pollInterval: 0
      }
    }),

    // Compress assets with Brotli and Gzip in parallel using vite-plugin-compression2
    compression({
      algorithms: ['brotliCompress', 'gzip'],
      threshold: 1024
    })
  ],

  // Pre-bundle Appwrite SDK during dev to prevent Vite re-bundling latency and browser WebSocket drops
  optimizeDeps: {
    include: ['appwrite']
  },

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
          // Separate Markdown parsing libraries into a standalone chunk
          if (
            id.includes('mdsvex') ||
            id.includes('unified') ||
            id.includes('remark') ||
            id.includes('rehype')
          ) {
            return 'markdown'
          }

          // Isolate Appwrite Web SDK into its own vendor chunk to enable long-term HTTP caching
          // and prevent blocking the initial page hydration when loaded dynamically
          if (id.includes('node_modules/appwrite')) {
            return 'appwrite'
          }

          // Let Rollup handle Svelte runtime & dynamic routes automatically
          // to avoid hydration mismatch and bundle bloat.
        }
      },
      treeshake: {
        moduleSideEffects: (id) => {
          // Preserve side effects for CSS and Web Fonts
          if (id.includes('.css') || id.includes('fontsource')) {
            return true
          }
          // Enable aggressive tree-shaking for node_modules
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
