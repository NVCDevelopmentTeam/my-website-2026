<script>
	import { siteConfig } from '$lib/config';
	import PostsList from '$lib/components/PostsList.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	// Get data from server
	let { data } = $props();

	// Always fallback to avoid SSR errors
	let posts = $derived(data?.posts ?? []);
	
	// SEO metadata
	const metadata = {
		title: 'Blog',
		description: siteConfig.description
	};
</script>

<svelte:head>
	<title>
		{metadata.title
			? `${metadata.title} — ${siteConfig.title}`
			: siteConfig.title}
	</title>

	<meta
		name="description"
		content={metadata.description ?? siteConfig.description}
	/>
</svelte:head>

<section class="max-w-4xl mx-auto px-4 py-12">
	<h1 class="text-4xl sm:text-5xl font-black text-center mb-16 tracking-tight">
		<span class="bg-clip-text text-transparent bg-gradient-to-r from-sky-800 to-violet-950 dark:from-sky-400 dark:to-violet-400">
			Blog
		</span>
	</h1>

	{#if posts.length > 0}
		<!-- Post list -->
		<PostsList {posts} />

		<!-- Pagination - pass data.metadata from server -->
		<div class="mt-12">
			<Pagination metadata={data.metadata} />
		</div>
	{:else}
		<p class="text-center text-gray-800 dark:text-gray-400 text-lg italic">
			Chưa có bài viết nào được đăng.
		</p>
	{/if}
</section>
