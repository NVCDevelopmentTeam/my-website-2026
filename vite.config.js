import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'
import { enhancedImages } from '@sveltejs/enhanced-img'

export default defineConfig({
  plugins: [
    enhancedImages(),
    sveltekit(),
    compression({
      algorithm: 'brotliCompress'
    }),
    tailwindcss()
  ],

  build: {
    // Minify output
    minify: true,
    // Enable css code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('sveltia')) {
              return 'cms'
            }
            return 'vendor'
          }
        }
      }
    }
  },

  server: {
    fs: {
      allow: ['.']
    }
  }
})
