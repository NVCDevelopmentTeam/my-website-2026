<script>
	import { siteConfig } from '$lib/config';

	const { data } = $props();
	const { tags, totalTags } = $derived.by(() => data);

	// SEO metadata
	const metadata = $derived.by(() => ({
		title: 'Tất cả thẻ',
		description: `Khám phá ${totalTags || 0} thẻ cho bài viết trên ${siteConfig.title}`
	}));
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

<div class="container mx-auto px-4 py-16">
	<div class="max-w-3xl mx-auto">

		<!-- Title -->
		<h1 class="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">
			Tất cả thẻ 
			<span class="text-gray-700 dark:text-gray-400 text-2xl">
				({totalTags || 0})
			</span>
		</h1>

		<!-- Tags cloud (WordPress style) -->
		{#if tags?.length > 0}
			<div class="flex flex-wrap gap-3 justify-center">
				{#each tags as tag (tag.slug)}
					<a
						href={`/blog/tag/${tag.slug}`}
						class="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 font-medium text-sm group"
					>
						<svg class="w-4 h-4 text-purple-500 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
						</svg>
						<span class="group-hover:scale-105 transition-transform">
							{tag.title}
						</span>
						<span class="text-xs text-purple-900 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full">
							{tag.count}
						</span>
					</a>
				{/each}
			</div>

		{:else}
			<p class="text-center text-gray-800 dark:text-gray-400 text-lg italic">
				Chưa có thẻ nào được gắn cho bài viết.
			</p>
		{/if}
	</div>
</div>
