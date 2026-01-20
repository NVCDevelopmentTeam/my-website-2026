import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('@sveltia/cms')) {
            return 'sveltia-cms'
          }
        }
      }
    },
    chunkSizeWarningLimit: 2000 // Increase limit to suppress CMS chunk warning
  }
})
