<script>
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
			month: 'short', 
			year: 'numeric' 
		});
	}
</script>

<aside class="space-y-4">
	<!-- Header với accent line - WordPress style -->
	<div class="relative">
		<h2 class="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
			Bài viết gần đây
		</h2>
		<div class="mt-2 h-0.5 w-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full"></div>
	</div>

	{#if recentPosts.length > 0}
		<!-- Posts list - Hugo minimalist style -->
		<div class="space-y-3">
			{#each recentPosts as post (post.slug)}
				<article class="group">
					<a 
						href={`/blog/${post.slug}`}
						class="block p-4 rounded-xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm
						       border border-gray-200/50 dark:border-gray-700/50
						       hover:bg-white dark:hover:bg-gray-800
						       hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-600
						       transition-all duration-300 ease-out
						       hover:-translate-y-0.5"
					>
						<!-- Category badge - floating top right -->
						{#if post.metadata.categories?.[0]}
							<div class="flex items-start justify-between gap-3 mb-2">
								<span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
								             bg-sky-50 dark:bg-sky-900/30 
								             text-sky-700 dark:text-sky-300
								             border border-sky-200/50 dark:border-sky-700/50">
									{post.metadata.categories[0]}
								</span>
							</div>
						{/if}

						<!-- Title - Bold and prominent -->
						<h3 class="text-base font-semibold text-gray-900 dark:text-white 
						           leading-snug mb-2
						           group-hover:text-sky-600 dark:group-hover:text-sky-400 
						           transition-colors duration-200
						           line-clamp-2">
							{post.metadata.title}
						</h3>

						<!-- Meta info - Date with icon -->
						<div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
								      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<time datetime={post.metadata.date} class="font-medium">
								{formatDate(post.metadata.date)}
							</time>
						</div>

						<!-- Excerpt - subtle and concise -->
						{#if post.metadata.description}
							<p class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
								{post.metadata.description}
							</p>
						{/if}

						<!-- Read more indicator - appears on hover -->
						<div class="mt-3 flex items-center text-xs font-medium text-sky-600 dark:text-sky-400
						            opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<span>Đọc thêm</span>
							<svg class="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" 
							     fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</div>
					</a>
				</article>
			{/each}
		</div>

		<!-- View all link - WordPress style CTA -->
		<div class="pt-2">
			<a 
				href="/blog"
				class="inline-flex items-center justify-center gap-2 w-full
				       px-4 py-2.5 rounded-lg
				       text-sm font-semibold
				       bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20
				       text-sky-700 dark:text-sky-300
				       border border-sky-200/50 dark:border-sky-700/50
				       hover:from-sky-100 hover:to-blue-100 dark:hover:from-sky-900/30 dark:hover:to-blue-900/30
				       hover:border-sky-300 dark:hover:border-sky-600
				       transition-all duration-300
				       hover:shadow-md"
			>
				<span>Xem tất cả bài viết</span>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
				</svg>
			</a>
		</div>
	{:else}
		<!-- Empty state - Clean and minimal -->
		<div class="py-12 px-6 text-center
		            bg-gradient-to-br from-gray-50 to-gray-100/50 
		            dark:from-gray-800/30 dark:to-gray-900/20
		            rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
			<svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" 
			     fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
				      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
			</svg>
			<p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
				Chưa có bài viết nào được đăng
			</p>
		</div>
	{/if}
</aside>