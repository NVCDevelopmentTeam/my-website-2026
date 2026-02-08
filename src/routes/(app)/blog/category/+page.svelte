<script>
	import { siteConfig } from '$lib/config';

	const { data } = $props();
	const { uniqueCategories, totalCategories } = $derived.by(() => data);

	// SEO metadata - use $derived for reactivity
	const metadata = $derived.by(() => ({
		title: 'Danh mục bài viết',
		description: `Khám phá ${totalCategories || 0} danh mục bài viết trên ${siteConfig.title}`
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
		<h1 class="text-4xl font-black text-center mb-10 text-gray-950 dark:text-gray-50">
			Tất cả danh mục 
			            <span class="text-gray-950 dark:text-gray-50 text-2xl">				({totalCategories || 0})
			</span>
		</h1>

		<!-- Category list -->
		{#if uniqueCategories?.length > 0}
			<ul class="divide-y divide-gray-200 dark:divide-gray-700">

				{#each uniqueCategories as category (category.slug)}
					<li class="py-4">
						<a
							href={`/blog/category/${category.slug}`}
							class="flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 py-2 rounded-lg transition-colors"
						>
							<!-- Category name with count (WordPress style) -->
							<span
								class="text-lg font-black text-blue-800 dark:text-blue-300 group-hover:underline"
							>
								{category.title} ({category.count})
							</span>
						</a>
					</li>
				{/each}

			</ul>

		{:else}
			<p class="text-center text-gray-950 dark:text-gray-50 text-lg font-bold italic">
				Chưa có danh mục nào được gắn cho bài viết.
			</p>
		{/if}
	</div>
</div>
