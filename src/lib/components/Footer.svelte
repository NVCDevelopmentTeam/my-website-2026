<script>
	import { siteConfig } from '$lib/config';
	import LegalMenu from './LegalMenu.svelte';

	/**
	 * Svelte 5 Props
	 */
	let { pages = [] } = $props();
</script>

<footer
	class="mt-20 bg-gray-50 dark:bg-gray-950
	       border-t border-gray-100 dark:border-gray-800
	       text-gray-900 dark:text-gray-100
	       transition-colors">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
		<div class="flex flex-col md:flex-row justify-between items-start gap-12">
			<!-- Minimal navigation -->
			<nav class="space-y-4">
				<h3 class="text-sm font-black text-gray-950 dark:text-gray-50 uppercase tracking-widest">
liên kết hữu ích
				</h3>
				<LegalMenu {pages} />
			</nav>

					<!-- Brand & Copyright -->
			<div class="space-y-4 max-w-sm">
				<p class="text-sm leading-relaxed font-bold">
					&copy; {new Date().getFullYear()} {siteConfig.author.name}. Mọi quyền được bảo lưu.
					Website được thiết kế đáp ứng tiêu chuẩn WCAG 2.2 AAA.
				</p>
			</div>

		</div>

		<!-- Bottom decoration line -->
		<div class="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-center">
			<div class="flex gap-3">
				<span class="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800"></span>
				<span class="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600"></span>
				<span class="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800"></span>
			</div>
		</div>
	</div>
</footer>

