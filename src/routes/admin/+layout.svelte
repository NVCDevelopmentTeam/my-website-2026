<script>
  import logo from '$lib/assets/logo.svg'
  import SkipLink from '$lib/components/SkipLink.svelte'
  import { siteConfig } from '$lib/config'

  let { children } = $props()
</script>

<div
  class="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100"
>
  <!-- Header -->
  <header
    class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90"
  >
    <SkipLink />
    <div class="mx-auto max-w-7xl flex items-center justify-between px-4 py-4">
      <a href="/admin" class="flex items-center gap-3">
        <img
          src={logo}
          alt="Logo Coding Nguyễn"
          width="40"
          height="40"
          class="h-10 w-auto rounded-full"
          loading="lazy"
          decoding="async"
        />
        <span class="text-xl text-gray-950 font-black tracking-wide dark:text-gray-50">
          Bảng quản trị
        </span>
      </a>
    </div>
  </header>

  <!-- Main -->
  <main id="main-content" tabindex="-1" class="container mx-auto flex-1 bg-gray-50 p-4">
    {@render children?.()}
  </main>

  <!-- Footer -->
  <footer class="border-t border-gray-200 bg-white py-6 dark:border-gray-800 dark:bg-gray-900">
    <div
      class="mx-auto max-w-7xl flex flex-col items-center justify-between gap-3 px-4 text-sm sm:flex-row"
    >
      <a
        href="/"
        class="text-sky-800 font-bold transition-colors dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
      >
        ← Quay về trang chủ
      </a>
      <p class="text-gray-950 font-bold dark:text-gray-50">
        {siteConfig?.title ?? 'Coding Nguyễn'} Quản trị
      </p>
    </div>
  </footer>
</div>
