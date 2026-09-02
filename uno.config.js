// uno.config.js
import { defineConfig, presetUno, presetTypography } from 'unocss'

export default defineConfig({
  // ─────────────────────────────────────────────────────────
  // DARK MODE — class-based to match app.html toggle
  // ─────────────────────────────────────────────────────────
  darkMode: 'class',

  // ─────────────────────────────────────────────────────────
  // PRESETS
  // ─────────────────────────────────────────────────────────
  presets: [
    presetUno({ dark: 'class' }), // class-based dark mode
    presetTypography()
  ],

  // ─────────────────────────────────────────────────────────
  // CONTENT SCANNING
  // ─────────────────────────────────────────────────────────
  content: {
    filesystem: ['src/**/*.{svelte,js,ts,html,md}']
  },

  // ─────────────────────────────────────────────────────────
  // SAFELIST
  // ─────────────────────────────────────────────────────────
  safelist: [
    'dark',
    'container',
    'sr-only',
    'safe-top',
    'safe-bottom',
    'safe-x',
    // presetTypography's nested selectors (e.g. `.prose h1`) can't be
    // rewritten into a per-component scoped hash, so these must stay global.
    'prose',
    'prose-neutral',
    'prose-invert',
    'not-prose',
    // Used directly on <body> in app.html, a plain HTML file that the
    // svelte-scoped compiler (which only processes .svelte files) never sees.
    'bg-white',
    'dark:bg-gray-950'
  ]
})
