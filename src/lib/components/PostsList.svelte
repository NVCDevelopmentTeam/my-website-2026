<script>
	import PostDate from './PostDate.svelte';
	import PostAuthor from './PostAuthor.svelte';
	import PostCategories from './PostCategories.svelte';
	import PostPreview from './PostPreview.svelte';

	let { posts = [] } = $props();
</script>

<ul class="space-y-8">
{#each posts as post (post.slug)}
		<li
			class="group p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 shadow-sm
			hover:shadow-xl transition duration-300 border border-gray-100 dark:border-gray-700"
		>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<article class="h-full flex flex-col">
			<a href={`/blog/${post.slug}`} data-sveltekit-preload-data="hover" class="block space-y-3">
				<!-- Post title -->
				<h2
					class="text-2xl font-semibold text-gray-900 dark:text-gray-100
					group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"
				>
					{post.metadata.title}
				</h2>
			</a>
				<!-- Meta (date, author, category) -->
				<div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
		<PostAuthor {post} />
					<span aria-hidden="true">•</span>
<PostDate {post} />
					<span aria-hidden="true">•</span>
		<PostCategories {post} />
				</div>

				<!-- Short description -->
    <PostPreview {post} />
				</article>
		</li>
	{/each}
</ul>
