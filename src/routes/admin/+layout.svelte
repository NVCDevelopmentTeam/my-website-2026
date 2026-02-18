<script>
	import logo from '$lib/assets/logo.svg';
	import SkipLink from '$lib/components/SkipLink.svelte';
	import { siteConfig } from '$lib/config';

	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
	<!-- Header -->
	<header
		class="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50"
		
	>
		<SkipLink />
		<div class="max-w-7xl mx-auto px-4 flex items-center justify-between py-4">
			<a href="/admin" class="flex items-center gap-3">
				<img src={logo} alt="Logo Coding Nguyễn" class="h-10 w-auto rounded-full" loading="lazy" decoding="async" />
				<span class="text-xl font-black text-gray-950 dark:text-gray-50 tracking-wide">
					Bảng quản trị
				</span>
			</a>
		</div>
	</header>

	<!-- Main -->
	<main
		id="main-content"
		tabindex="-1" class="flex-1 container mx-auto p-4 bg-gray-50">
		{@render children?.()}
	</main>

	<!-- Footer -->
	<footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6">
		<div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
			<a
				href="/"
				class="text-sky-800 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-bold transition-colors"
			>
				← Quay về trang chủ
			</a>
			<p class="text-gray-950 dark:text-gray-50 font-bold">
				{siteConfig?.title ?? 'Coding Nguyễn'} Quản trị
			</p>
		</div>
	</footer>
</div>

