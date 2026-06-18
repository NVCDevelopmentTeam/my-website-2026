import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    sveltekit(),
    compression({
      algorithm: 'brotliCompress'
    }),
    tailwindcss()
  ],

  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    alias: {
      $lib: '/src/lib',
      '$app/environment': '/src/tests/mocks/app-environment.js'
    }
  },

  build: {
    cssCodeSplit: true,
    reportCompressedSize: false,
    // Inline small assets to reduce HTTP requests
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: function (id) {
          if (id.includes('node_modules')) {
            if (id.includes('sveltia')) {
              return 'cms'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})
