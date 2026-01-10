// svelte.config.js
import adapter from '@sveltejs/adapter-netlify'
import { mdsvex } from 'mdsvex'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import mdsvexConfig from './mdsvex.config.js'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],

  preprocess: [
    vitePreprocess({
      postcss: true // Enable PostCSS (for Tailwind)
    }),
    mdsvex(mdsvexConfig)
  ],

  kit: {
    adapter: adapter(),

    // Prerender for static generation
    prerender: {
      entries: ['*', '/sitemap.xml', '/rss.xml']
    }
  }
}

export default config
