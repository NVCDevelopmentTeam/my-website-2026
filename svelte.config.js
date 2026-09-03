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

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', ...mdsvexExtensions],
  preprocess: [
    stripSvelteAnnouncer,
    mdsvex(mdsvexConfig),
    modernizeMdsvexModuleScript,
    vitePreprocess()
  ],

  // Enforce Svelte 5 Runes mode for application files while skipping node_modules
  compilerOptions: {
    runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
  },

  kit: {
    // Static adapter configuration for production static site deployment
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
  }
}

export default config
