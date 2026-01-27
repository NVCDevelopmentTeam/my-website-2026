<script>
	import { siteConfig } from '$lib/config';
	import PostsList from '$lib/components/PostsList.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import Seo from 'sk-seo';
	import { getSeoConfig } from '$lib/utils/seo';
	import { page } from '$app/state';

	const { data } = $props();
	const { category, posts } = $derived.by(() => data);

	const seoConfig = $derived(getSeoConfig({
		title: `Danh mục: ${category?.title || 'Không xác định'}`,
		description: category?.description || `Các bài viết thuộc danh mục "${category?.title || 'này'}" trên ${siteConfig.title}.`,
		url: page.url.pathname
	}));
</script>

<svelte:head>
	<Seo {...seoConfig} />
</svelte:head>

<section class="max-w-4xl mx-auto px-4 py-12">
	<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
		{category?.title || 'Danh mục'}
	</h1>
	
	{#if category?.description}
		<p class="mt-2 text-gray-600 dark:text-gray-400">
			{category.description}
		</p>
	{/if}

	{#if posts?.length > 0}
		<!-- Like WordPress: post list -->
		<PostsList {posts} />

		<!-- Pagination - pass data.metadata from server -->
		<div class="mt-10">
			<Pagination metadata={data.metadata} />
		</div>
	{:else}
		<p class="text-center text-gray-600 dark:text-gray-400 italic mt-8">
			Chưa có bài viết nào trong danh mục này.
		</p>
	{/if}
</section>