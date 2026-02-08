<script>
	import { siteConfig } from '$lib/config';
	import PostsList from '$lib/components/PostsList.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { getSeoConfig } from '$lib/utils/seo';

  let { data } = $props();

  // Reactive in Svelte 5 style - extract category and posts
  let category = $derived(data.category); // Tag object: { name, slug, count, description, title }
  let posts = $derived(data.posts);

	const seoConfig = $derived(
		getSeoConfig({
			title: `Danh mục: ${category?.title || 'Không xác định'}`,
			description: category?.description || `Các bài viết thuộc danh mục "${category?.title || 'này'}" trên ${siteConfig.title}.`,
			url: `/blog/category/${category?.slug}`
		})
	);
</script>

<SEO {...seoConfig} />

<section class="px-4 py-12">
	<h1 class="text-3xl font-black text-gray-950 dark:text-gray-50">
		{category?.title || 'Danh mục'}
	</h1>
	
	<p class="mt-2 text-gray-950 dark:text-gray-50 font-bold">
		Danh mục {category?.title} có {data.pagination?.totalPosts || 0} bài viết
	</p>

	{#if posts.length > 0}
		<PostsList {posts} />

		<!-- Pagination - pass data.metadata from server -->
		<div class="mt-12">
			<Pagination pagination={data.pagination} />
		</div>
	{:else}
		<p class="text-center text-gray-950 dark:text-gray-50 font-bold italic mt-8">
			Chưa có posts nào trong danh mục này.
		</p>
	{/if}
</section>