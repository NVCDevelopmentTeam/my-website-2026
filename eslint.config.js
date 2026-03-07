import { defineConfig, globalIgnores } from 'eslint/config'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'
import svelteConfig from './svelte.config.js'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// Resolve full absolute path to `.gitignore`
const gitignorePath = resolve(__dirname, '.gitignore')

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
  // 1. Load ignore patterns from .gitignore using absolute path
  includeIgnoreFile(gitignorePath),

  // 2. Global ignores (ESLint 10 uses globalIgnores() helper)
  globalIgnores(['dist/**', '**/*.config.js']),

  // 3. JS recommended
  js.configs.recommended,

  // 4. Svelte + Prettier recommended configs
  ...svelte.configs.recommended,
  prettierConfig,
  ...svelte.configs.prettier,

  // 5. Set global browser + node globals
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        client: 'readonly',
        gtag: 'readonly'
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },

  // 6. Specific overrides for `.svelte` files
  {
    files: ['**/*.svelte', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        svelteConfig
      }
    },
    rules: {
      'svelte/no-parsing-error': 'off',
      'svelte/no-navigation-without-resolve': 'off',
      'svelte/prefer-svelte-reactivity': 'off'
    }
  }
])
