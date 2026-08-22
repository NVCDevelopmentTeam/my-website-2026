import { defineConfig, globalIgnores } from 'eslint/config'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const gitignorePath = resolve(__dirname, '.gitignore')

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
  // 1. Load ignore rules from .gitignore
  includeIgnoreFile(gitignorePath),

  // 2. Global ignores for build artifacts and static/markdown content
  globalIgnores(['.svelte-kit/**', 'build/**', 'dist/**', '**/*.md', '**/*.svx', 'Check.json']),

  // 3. JS recommended
  js.configs.recommended,

  // 4. Svelte recommended + Prettier compatibility
  ...svelte.configs.recommended,
  prettierConfig,
  ...svelte.configs.prettier,

  // 5. Globals & language options
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
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },

  // 6. Svelte component configurations
  {
    files: ['**/*.svelte', '**/*.svelte.js'],
    rules: {
      'svelte/no-parsing-error': 'off',
      'svelte/no-navigation-without-resolve': 'off',
      'svelte/prefer-svelte-reactivity': 'off',
      'svelte/valid-compile': 'off'
    }
  },

  // 7. Config files running in Node environment
  {
    files: ['*.config.js', '*.config.mjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
])
