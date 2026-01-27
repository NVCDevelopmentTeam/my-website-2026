<script>
	import PostDate from './PostDate.svelte';
	import PostAuthor from './PostAuthor.svelte';
	import PostCategories from './PostCategories.svelte';
	import PostPreview from './PostPreview.svelte';

	let { posts = [] } = $props();
</script>

<ol class="space-y-12">
{#each posts as post (post.slug)}
		<li
			class="group animate-slide-up"
		>
				<article class="flex flex-col gap-4">
          <header class="space-y-3">
            <div class="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-950 dark:text-gray-300">
              <PostDate {post} />
              <span aria-hidden="true" class="text-gray-400 dark:text-gray-600">|</span>
              <PostCategories {post} />
            </div>

            <a href={`/blog/${post.slug}`} data-sveltekit-preload-data="hover" class="block group">
              <h2
                class="text-2xl sm:text-3xl font-bold text-gray-950 dark:text-white
                group-hover:text-sky-800 dark:group-hover:text-sky-400 transition-colors duration-300"
              >
                {post.metadata.title}
              </h2>
            </a>
          </header>

          <PostPreview {post} />
          
          <footer class="flex items-center gap-4 pt-2">
            <PostAuthor {post} />
          </footer>
				</article>
		</li>
	{/each}
</ol>
