import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import UnoCSS from '@unocss/svelte-scoped/vite'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    // UnoCSS svelte-scoped: injects utility CSS directly into component <style> blocks.
    // Must be placed before sveltekit() as it acts as a preprocessor.
    UnoCSS(),

    // SvelteKit options (preprocess, compilerOptions, kit) now live in svelte.config.js
    sveltekit(),

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
