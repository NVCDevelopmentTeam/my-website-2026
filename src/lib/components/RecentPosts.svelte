<script>
	import { slugify } from '$lib/utils/slugify';

	/**
	 * @typedef {import('$lib/data/posts').Post} Post
	 * @typedef {Object} Props
	 * @property {Post[]} recentPosts
	 */

	/** @type {Props} */
	let { recentPosts = [] } = $props();

	// Format date theo style WordPress
	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString('vi-VN', { 
			day: 'numeric', 
			month: 'long', 
			year: 'numeric' 
		});
	}
</script>

{#if recentPosts.length > 0}
	<!-- WordPress-style simple list using semantic <ol> -->
	<ol class="space-y-4">
		{#each recentPosts as post (post.slug)}
			<li class="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
				<article>
					<!-- Title -->
					<h3 class="text-base font-bold leading-snug mb-1">
						<a 
							href={`/blog/${post.slug}`}
							class="text-gray-950 dark:text-gray-100 hover:text-sky-800 dark:hover:text-sky-400 transition-colors duration-300"
						>
							{post.metadata.title}
						</a>
					</h3>

					<!-- Meta info - Date & Categories in list format -->
					<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
						<!-- Date -->
						<time datetime={post.metadata.date} class="text-xs text-gray-800 dark:text-gray-400 font-medium">
							{formatDate(post.metadata.date)}
						</time>

						<!-- Categories list -->
						{#if post.metadata.categories?.length > 0}
							<div class="text-xs flex items-center gap-1">
								<span class="text-gray-300 dark:text-gray-700">•</span>
								<nav aria-label="Danh mục của bài viết" class="inline">
									<ul class="inline">
										{#each post.metadata.categories as cat, i (cat)}
											<li class="inline">
												<a 
													href={`/blog/category/${slugify(cat)}`}
													class="text-sky-800 dark:text-sky-400 hover:underline"
												>
													{cat}</a>{#if i < post.metadata.categories.length - 1}<span class="text-gray-400">, </span>{/if}
											</li>
										{/each}
									</ul>
								</nav>
							</div>
						{/if}
					</div>

					<!-- Excerpt if available -->
					{#if post.metadata.excerpt && post.metadata.excerpt !== 'Bài viết chưa có mô tả.'}
						<p class="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2 leading-relaxed">
							{post.metadata.excerpt}
						</p>
					{/if}
				</article>
			</li>
		{/each}
	</ol>
{:else}
	<p class="text-sm text-gray-800 dark:text-gray-400 italic">
		Chưa có bài viết nào.
	</p>
{/if}
