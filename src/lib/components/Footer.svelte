<!-- @migration-task Error while migrating Svelte code: Identifier 'RecentPosts' has already been declared
https://svelte.dev/e/js_parse_error -->
<script>
	import { siteConfig } from '$lib/config';
	import RecentPosts from './RecentPosts.svelte';
 import LegalMenu from './LegalMenu.svelte';
import SocialMenu from './SocialMenu.svelte';

	
	/**
	 * @typedef {Object} Props
	 * @property {import('$lib/data/posts.server').Post[]} [latestPosts]
	 * @property {any[]} [pages]
	 */

	/** @type {Props} */
	let { recentPosts = [], pages = [] } = $props();
</script>

<footer class="bg-white dark:bg-gray-900 mt-20 border-t border-gray-100 dark:border-gray-800 transition-colors">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
      <!-- About / Intro -->
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">{siteConfig.title}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {siteConfig.description}
        </p>
        <SocialMenu />
      </div>

      <!-- Recent Posts -->
      <div class="lg:col-span-2">
        <RecentPosts {recentPosts} />
      </div>

      <!-- Legal & Navigation -->
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Liên kết hữu ích</h3>
        <LegalMenu {pages} />
      </div>
    </div>

    <!-- Copyright -->
    <div class="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left">
        <p>&copy; {new Date().getFullYear()} {siteConfig.author.name}. Mọi quyền được bảo lưu.</p>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-400">
        <span>Thiết kế và vận hành bởi {siteConfig.author.name}.</span>
      </div>
    </div>
  </div>
</footer>
