<script>
  import { siteConfig } from '$lib/config'
</script>

<svelte:head>
  <title>Trang không tồn tại – {siteConfig.title}</title>
  <meta name="robots" content="noindex, follow" />
  <meta name="description" content="Trang bạn tìm không tồn tại hoặc đã bị xóa." />
  <meta property="og:title" content="Trang không tồn tại" />
  <meta property="og:description" content="Liên kết này có thể đã hết hạn hoặc bị di chuyển." />
  <meta property="og:type" content="website" />
  <!-- Fix: use siteConfig.siteUrl -->
  <meta property="og:url" content={siteConfig.siteUrl + '/404'} />
</svelte:head>

<section
  class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center text-gray-950 dark:bg-gray-950 dark:text-gray-50"
>
  <div class="max-w-md space-y-4">
    <h1 class="text-7xl text-sky-800 font-black dark:text-sky-400">404</h1>

    <h2 class="text-2xl font-black">Ôi, hỏng rồi</h2>

    <p class="text-gray-950 font-bold dark:text-gray-50">
      Trang bạn vừa truy cập không hợp lệ. Bạn vui lòng thử truy cập lại hoặc
    </p>

    <a
      href="/"
      class="mt-6 inline-flex items-center justify-center rounded-lg bg-sky-800 px-6 py-3 text-white font-black transition-colors dark:bg-sky-500 hover:bg-sky-900 focus:outline-none focus:ring-4 focus:ring-sky-400 dark:hover:bg-sky-600"
    >
      ← Quay về trang chủ
    </a>
  </div>
</section>
