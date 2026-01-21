<script>
	import { siteConfig } from '$lib/config';

	const { data } = $props();
	const { uniqueTags, totalTags } = $derived.by(() => data);

	// SEO metadata
	const metadata = {
		title: 'Từ khóa bài viết',
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
			Tất cả từ khóa 
			<span class="text-gray-500 dark:text-gray-400 text-2xl">
				({totalTags})
			</span>
		</h1>

		<!-- Tag list -->
		{#if uniqueTags.length > 0}
			<ul class="divide-y divide-gray-200 dark:divide-gray-700">

				{#each uniqueTags as tag (tag.title)}
					<li class="py-4">
						<a
							href={`/blog/tag/${tag.title}`}
							class="flex items-center justify-between group"
						>
							<!-- Tag name -->
							<span
								class="text-lg font-medium text-blue-600 dark:text-blue-400 group-hover:underline capitalize"
							>
								{tag.title}
							</span>

							<!-- Number of posts on the same line (WordPress standard) -->
							<span
								class="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
							>
								{tag.count}
							</span>
						</a>
					</li>
				{/each}

			</ul>

		{:else}
			<p class="text-center text-gray-600 dark:text-gray-400 text-lg italic">
				Chưa có từ khóa nào được gắn cho bài viết.
			</p>
		{/if}
	</div>
</div>
