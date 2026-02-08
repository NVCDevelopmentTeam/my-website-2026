<script>
	import { siteConfig } from '$lib/config';
	import PostsList from '$lib/components/PostsList.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { getSeoConfig } from '$lib/utils/seo';

	// Get data from server
	let { data } = $props();

	// Always fallback to avoid SSR errors
	let posts = $derived(data?.posts ?? []);
	
	// SEO configuration
	const seoConfig = getSeoConfig({
		title: 'Blog',
		description: siteConfig.description,
		url: '/blog'
	});
</script>

<SEO {...seoConfig} />

<section class="px-4 py-12">
	<h1 class="text-4xl sm:text-5xl font-black text-center mb-16 tracking-tight">
		<span class="bg-clip-text text-transparent bg-gradient-to-r from-sky-800 to-violet-950 dark:from-sky-400 dark:to-violet-400">
			Blog
		</span>
	</h1>

	{#if posts.length > 0}
		<!-- Post list -->
		<PostsList {posts} />

		<!-- Pagination - pass data.pagination from server -->
		<div class="mt-12">
			<Pagination pagination={data.pagination} />
		</div>
	{:else}
		<p class="text-center text-gray-950 dark:text-gray-50 text-lg font-bold italic">
			Chưa có bài viết nào được đăng.
		</p>
	{/if}
</section>
