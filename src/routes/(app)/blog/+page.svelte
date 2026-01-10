<script>
	import { siteConfig } from '$lib/config';
	import PostsList from '$lib/components/PostsList.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	// Get data from server
	let { data } = $props();

	// Always fallback to avoid SSR errors
	let posts = $derived(data?.posts ?? []);
	let pagination = $derived(
		data?.pagination ?? {
			currentPage: 1,
			totalPages: 1,
			totalPosts: 0
		}
	);



	// SEO metadata
	const metadata = {
		title: 'Bài viết',
		description: siteConfig.description
	};
</script>

<svelte:head>
	<title>
		{metadata.title
			? `${metadata.title} – ${siteConfig.title}`
			: siteConfig.title}
	</title>

	<meta
		name="description"
		content={metadata.description ?? siteConfig.description}
	/>
</svelte:head>

<section class="max-w-4xl mx-auto px-4 py-12">
	<h1 class="text-4xl font-extrabold text-center mb-10 tracking-tight">
		<span class="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-violet-500">
			Bài viết
		</span>
	</h1>

	{#if posts.length > 0}
		<!-- Post list -->
		<PostsList {posts} />

		<!-- Pagination -->
		{#if pagination.totalPages > 1}
			<div class="mt-12">
				<Pagination
					currentPage={pagination.currentPage}
					totalPosts={pagination.totalPosts}
					baseUrl="/blog"
				/>
			</div>
		{/if}
	{:else}
		<p class="text-center text-gray-600 dark:text-gray-400 text-lg">
			Chưa có bài viết nào được đăng.
		</p>
	{/if}
</section>
