<script>
	import { siteConfig } from '$lib/config';

	const { data } = $props();
	const { uniqueCategories, totalCategories } = $derived.by(() => data);

	// SEO metadata
	const metadata = {
		title: 'Danh mục bài viết',
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

<div class="container mx-auto px-4 py-16">
	<div class="max-w-3xl mx-auto">

		<!-- Title -->
		<h1 class="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">
			Tất cả danh mục 
			<span class="text-gray-500 dark:text-gray-400 text-2xl">
				({totalCategories})
			</span>
		</h1>

		<!-- Category list -->
		{#if uniqueCategories.length > 0}
			<ul class="divide-y divide-gray-200 dark:divide-gray-700">

				{#each uniqueCategories as category (category.title)}
					<li class="py-4">
						<a
							href={`/blog/category/${category.title}`}
							class="flex items-center justify-between group"
						>
							<!-- Category name -->
							<span
								class="text-lg font-medium text-blue-600 dark:text-blue-400 group-hover:underline capitalize"
							>
								{category.title}
							</span>

							<!-- Number of posts on the same line (WordPress standard) -->
							<span
								class="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
							>
								{category.count}
							</span>
						</a>
					</li>
				{/each}

			</ul>

		{:else}
			<p class="text-center text-gray-600 dark:text-gray-400 text-lg italic">
				Chưa có danh mục nào được gắn cho bài viết.
			</p>
		{/if}
	</div>
</div>
