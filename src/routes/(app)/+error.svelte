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
  class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6
	text-center text-gray-950 dark:bg-gray-950 dark:text-gray-50"
>
  <div class="max-w-md space-y-4">
    <h1 class="text-7xl font-black text-sky-800 dark:text-sky-400">404</h1>

    <h2 class="text-2xl font-black">Ôi, hỏng rồi</h2>

    <p class="font-bold text-gray-950 dark:text-gray-50">
      Trang bạn vừa truy cập không hợp lệ. Bạn vui lòng thử truy cập lại hoặc
    </p>

    <a
      href="/"
      class="mt-6 inline-flex items-center justify-center rounded-lg bg-sky-800 px-6 py-3
			font-black text-white transition-colors hover:bg-sky-900 focus:ring-4
			focus:ring-sky-400 focus:outline-none dark:bg-sky-500 dark:hover:bg-sky-600"
    >
      ← Quay về trang chủ
    </a>
  </div>
</section>
