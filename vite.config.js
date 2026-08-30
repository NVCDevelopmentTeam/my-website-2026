import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import extractorSvelte from '@unocss/extractor-svelte'
import { compression } from 'vite-plugin-compression2'
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'

const mdsvexExtensions = ['.md', '.svx']

// Preprocessor xóa svelte-announcer (Svelte 5 Runes safe)
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

export default defineConfig({
  plugins: [
    // UnoCSS must come before sveltekit() so its virtual `uno.css` module
    // (imported in routes/+layout.svelte) is resolved correctly.
    UnoCSS({
      extractors: [extractorSvelte()]
    }),
    // Từ @sveltejs/kit >= 2.62.0, cấu hình của `kit` (adapter, prerender, version,
    // inlineStyleThreshold...) được truyền TRỰC TIẾP cùng cấp với các option của
    // vite-plugin-svelte (extensions, preprocess, compilerOptions) — KHÔNG bọc
    // trong object `kit: {...}` như trong svelte.config.js. Khi dùng cách này thì
    // svelte.config.js (nếu còn tồn tại) sẽ bị bỏ qua hoàn toàn.
    sveltekit({
      extensions: ['.svelte', ...mdsvexExtensions],
      preprocess: [
        stripSvelteAnnouncer,
        mdsvex(mdsvexConfig),
        modernizeMdsvexModuleScript,
        vitePreprocess()
      ],

      // Ép runes mode cho toàn bộ project, trừ các thư viện trong node_modules
      // (có thể bỏ điều kiện này khi lên Svelte 6, vì lúc đó runes sẽ mặc định bật).
      compilerOptions: {
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true
      },

      // --- các option dưới đây trước kia bị bọc nhầm trong `kit: {}` ---
      adapter: adapter({
        pages: 'build',
        assets: 'build',
        precompress: true, // Tự động tạo file .gz và .br tối ưu cho các route tĩnh
        strict: true,
        fallback: '404.html'
      }),
      inlineStyleThreshold: 30720, // Inline CSS dưới 30KB để giảm Blocking Request
      prerender: {
        handleUnseenRoutes: 'ignore',
        crawl: true
      },
      version: {
        pollInterval: 0
      }
    }),
    // Gộp gzip + brotli vào MỘT lần gọi plugin thay vì hai instance riêng —
    // API `algorithm` (số ít) của vite-plugin-compression2 là cú pháp cũ,
    // bản hiện tại dùng `algorithms` (mảng).
    compression({
      algorithms: ['brotliCompress', 'gzip'],
      threshold: 1024
    })
  ],

  build: {
    minify: true,
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    modulePreload: {
      polyfill: false
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Sveltia CMS + Appwrite are already loaded via a dynamic import()
          // in the /admin route (see routes/admin/+page.svelte), so Rollup's
          // default automatic chunking already isolates them into their own
          // lazy chunk without any help here.
          //
          // ⚠️ Do NOT force '@sveltia' into a manually-named chunk (previously
          // `if (id.includes('@sveltia')) return 'cms'`). Naming a chunk
          // manually turns it into a fixed merge point: Rollup then also uses
          // that same chunk to host the Svelte runtime helpers shared between
          // the CMS bundle and the rest of the app, which made the app-wide
          // runtime chunk (loaded on every single page, including the
          // homepage) statically import the ~2MB CMS/Appwrite bundle. Removing
          // the manual pin fixes that — verified via `.vite/manifest.json`:
          // the shared runtime chunk no longer imports the CMS chunk.
          if (
            id.includes('mdsvex') ||
            id.includes('unified') ||
            id.includes('remark') ||
            id.includes('rehype')
          )
            return 'markdown'

          // ⚠️ ĐÃ BỎ: Không can thiệp tách `@sveltejs/kit` và `/svelte/` runtime
          // Việc tách thủ công Svelte/SvelteKit core dễ gây lỗi Hydration
          // và phá vỡ cơ chế tự động Code-Splitting / Waterfall Prevention của SvelteKit.
        }
      },
      treeshake: {
        moduleSideEffects: (id) => {
          if (id.includes('.css') || id.includes('fontsource') || id.includes('uno.css')) {
            return true
          }
          if (id.includes('node_modules')) {
            return false
          }
          return true
        },
        propertyReadSideEffects: false
      }
    },
    target: ['es2020', 'chrome80', 'safari14', 'firefox78'],
    chunkSizeWarningLimit: 600
  },

  server: {
    // Bỏ `fs: { allow: ['.'] }` — đây chính xác là default của Vite (project root),
    // khai báo lại tường minh không thêm quyền truy cập nào cả, chỉ gây rối khi đọc
    // config. Nếu dự án là monorepo và cần đọc file ngoài root, hãy khai báo
    // đường dẫn cụ thể (VD: `allow: ['..']`) thay vì mở rộng chung chung.
    host: 'localhost',
    port: 5173,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  }
})
