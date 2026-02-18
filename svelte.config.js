import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Allow Svelte to recognize both .svelte files
  // and markdown-based components defined in mdsvex config
  extensions: ['.svelte', ...mdsvexConfig.extensions],

  // Preprocessors must be provided as an array
  // vitePreprocess handles Vite-related features
  // mdsvex processes markdown files
  preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],

  kit: {
    // Use the static adapter for building a static site
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      precompress: true,
      strict: true,
      fallback: '404.html'
    }),

    // Inline CSS into the HTML head if it's smaller than 10KB
    inlineStyleThreshold: 10240,

    // Ignore routes that are not explicitly prerendered
    prerender: {
      handleUnseenRoutes: 'ignore'
    }
  }
}

export default config
