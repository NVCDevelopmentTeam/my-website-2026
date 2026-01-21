<script>
	import { siteConfig } from '$lib/config';
	import RecentPosts from './RecentPosts.svelte';
	import LegalMenu from './LegalMenu.svelte';
	import SocialMenu from './SocialMenu.svelte';

	/**
	 * Svelte 5 Props
	 * Lưu ý: Tên biến prop (recentPosts) phải khác tên Component (RecentPosts)
	 * để tránh lỗi "Identifier has already been declared".
	 */
	let { recentPosts = [], pages = [] } = $props();
</script>

<footer
	class="mt-20 bg-white dark:bg-gray-900
	       border-t border-gray-300 dark:border-gray-700
	       text-gray-800 dark:text-gray-300
	       transition-colors"
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
			
			<!-- Brand -->
			<div class="space-y-4">
				<h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
					{siteConfig.title}
				</h3>

				<p class="text-sm leading-relaxed">
					{siteConfig.description}
				</p>

				<SocialMenu />
			</div>

			<!-- Recent posts -->
			<div class="lg:col-span-2">
				<RecentPosts {recentPosts} />
			</div>

			<!-- Legal -->
			<div class="space-y-4">
				<h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
					Liên kết hữu ích
				</h3>

				<LegalMenu {pages} />
			</div>
		</div>

		<!-- Bottom bar -->
		<div
			class="pt-8 border-t border-gray-300 dark:border-gray-700
			       flex flex-col md:flex-row items-center
			       justify-between gap-4"
		>
			<div class="text-xs text-center md:text-left">
				<p>
					&copy; {new Date().getFullYear()}
					<strong class="font-medium text-gray-900 dark:text-gray-100">
						{siteConfig.author.name}
					</strong>.
					Mọi quyền được bảo lưu.
				</p>
			</div>

			<div class="flex items-center gap-2 text-xs">
				<span>
					Thiết kế và vận hành bởi
					<strong class="font-medium text-gray-900 dark:text-gray-100">
						{siteConfig.author.name}
					</strong>.
				</span>
			</div>
		</div>
	</div>
</footer>
