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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    <h1 class="text-3xl font-bold">Không tìm thấy trang</h1>
    <p class="text-gray-600 dark:text-gray-400">Có thể liên kết đã bị di chuyển hoặc không tồn tại.</p>
    <a href={siteConfig.siteUrl} class="text-sky-600 hover:underline">Quay về trang chủ</a>
  </div>
</section>
=======
=======
>>>>>>> Stashed changes
		<h1 class="text-7xl font-extrabold text-sky-800 dark:text-sky-400">404</h1>

		<h2 class="text-2xl font-semibold">Ôi, hỏng rồi</h2>

		<p class="text-gray-800 dark:text-gray-400">
			Trang bạn vừa truy cập không hợp lệ. Bạn vui lòng thử truy cập lại hoặc 
		</p>

		<a
			href="/"
			class="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-lg font-medium
			bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600
			transition-colors focus:outline-none focus:ring-4 focus:ring-sky-400"
		>
			← Quay về trang chủ
		</a>
	</div>
</section>

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
