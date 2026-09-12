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
  // CUSTOM RULES — tailwindcss-animate-style classes used in
  // Menu.svelte / ToC.svelte / Contact.svelte / blog post page.
  // Not shipped by any preset — must be defined here or they
  // silently generate zero CSS (no error, no visual effect).
  // ─────────────────────────────────────────────────────────
  rules: [
    ['animate-in', { 'animation-fill-mode': 'both' }],
    ['fade-in', { animation: 'uno-fade-in 0.2s ease-out both' }],
    ['animate-fade-in', { animation: 'uno-fade-in 0.3s ease-out both' }],
    ['slide-in-from-right', { animation: 'uno-slide-in-from-right 0.2s ease-out both' }],
    ['slide-in-from-left-5', { animation: 'uno-slide-in-from-left-5 0.2s ease-out both' }],
    ['slide-in-from-top-2', { animation: 'uno-slide-in-from-top-2 0.2s ease-out both' }],
    ['slide-in-from-bottom-3', { animation: 'uno-slide-in-from-bottom-3 0.3s ease-out both' }],
    ['animate-progress', { animation: 'uno-progress 1.5s infinite ease-in-out' }]
  ],

  preflights: [
    {
      getCSS: () => `
        @keyframes uno-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes uno-slide-in-from-right {
          from { transform: translateX(100%) }
          to { transform: translateX(0) }
        }
        @keyframes uno-slide-in-from-left-5 {
          from { transform: translateX(-1.25rem); opacity: 0 }
          to { transform: translateX(0); opacity: 1 }
        }
        @keyframes uno-slide-in-from-top-2 {
          from { transform: translateY(-0.5rem); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
        @keyframes uno-slide-in-from-bottom-3 {
          from { transform: translateY(0.75rem); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
        @keyframes uno-progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); opacity: 0; }
        }
      `
    }
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
