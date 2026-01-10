<script>
	/**
	 * @typedef {import('$lib/data/posts').Post} Post
	 * @typedef {Object} Props
	 * @property {Post[]} latestPosts
	 */

	/** @type {Props} */
	let { latestPosts = [] } = $props();
</script>

<div class="space-y-4">
	<h2 class="text-2xl font-bold">Bài viết gần đây</h2>

	{#if latestPosts.length > 0}
		<ul class="space-y-2">
			{#each latestPosts as post (post.slug)}
				<li>
					<a
						href={`/blog/${post.slug}`}
						class="hover:text-sky-600"
					>
						{post.metadata.title}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-sm text-gray-500 italic">
			Chưa có bài viết nào.
		</p>
	{/if}
</div>
