<script>
	import { siteConfig } from '$lib/config';
	import LatestPosts from './LatestPosts.svelte';

	
	/**
	 * @typedef {Object} Props
	 * @property {import('$lib/data/posts').Post[]} [latestPosts]
	 */

	/** @type {Props} */
	let { latestPosts  } = $props();
</script>

<footer class="bg-gray-800 text-white p-4 text-center">
			<LatestPosts {latestPosts } />
	  <div class="flex justify-center space-x-4 mt-2">
	    <h3>Theo dõi mình trên</h3>
	    <ul>
	      <li><a href={siteConfig.social.facebook} class="hover:text-gray-400">Facebook</a></li>
	      <li><a href={siteConfig.social.zalo} class="hover:text-gray-400">Zalo</a></li>
	      <li><a href={siteConfig.social.github} class="hover:text-gray-400">Github</a></li>
	      <li><a href={siteConfig.social.viber} class="hover:text-gray-400">Viber</a></li>
	    </ul>
	  </div>	<p>&copy; {new Date().getFullYear()} {siteConfig.title}. Mọi quyền được bảo lưu.</p>
</footer>
