<script>
	import { siteConfig } from '$lib/config';
	import LatestPosts from './LatestPosts.svelte';
 import LegalMenu from './LegalMenu.svelte';
import SocialMenu from './SocialMenu.svelte';

	
	/**
	 * @typedef {Object} Props
	 * @property {import('$lib/data/posts').Post[]} [latestPosts]
	 */

	/** @type {Props} */
	let { latestPosts, pages } = $props();
</script>

<footer class="bg-gray-50 dark:bg-gray-800/50 mt-16 border-t border-gray-100 dark:border-gray-800">
			<LatestPosts {latestPosts } />
  <div class="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center gap-6">
    <SocialMenu />

    <LegalMenu {pages} />
    <div class="text-xs text-gray-400 text-center">
	  	<p>&copy; {new Date().getFullYear()} {siteConfig.author.name}. Mọi quyền được bảo lưu.</p>
    </div>
    
  </div>
</footer>
