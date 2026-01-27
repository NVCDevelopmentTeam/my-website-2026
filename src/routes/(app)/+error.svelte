<script>
	import { siteConfig } from '$lib/config';
	
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
	class="min-h-screen flex flex-col items-center justify-center text-center px-6
	bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100"
>
	<div class="max-w-md space-y-4">
    <h1 class="text-3xl font-bold">Không tìm thấy trang</h1>
    <p class="text-gray-600 dark:text-gray-400">Có thể liên kết đã bị di chuyển hoặc không tồn tại.</p>
    <a href={siteConfig.siteUrl} class="text-sky-600 hover:underline">Quay về trang chủ</a>
  </div>
</section>