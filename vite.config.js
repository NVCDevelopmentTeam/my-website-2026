import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],

  build: {
    // Minify output
    minify: true,
    // Enable css code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: false
  },

  server: {
    fs: {
      allow: ['.']
    }
  }
})
