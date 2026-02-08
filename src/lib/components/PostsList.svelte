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
      class="group p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 dark:border-gray-700"
    >
      <article class="h-full flex flex-col">
        <a href={`/blog/${post.slug}`} data-sveltekit-preload-data="hover"  class="block space-y-3">
          <h2
            class="text-xl sm:text-2xl font-black text-gray-950 dark:text-gray-50 group-hover:text-sky-800 dark:group-hover:text-sky-400 transition-colors"
          >
            {post.metadata.title}
          </h2>
        </a>

        <div class="flex flex-wrap items-center gap-3 text-sm text-gray-950 dark:text-gray-50 font-bold">
          <PostAuthor {post} />
          <span aria-hidden="true">•</span>
          <PostDate {post} />
          <span aria-hidden="true">•</span>
          <PostCategories {post} />
        </div>

        <PostPreview {post} />
      </article>
    </li>
  {/each}
</ul>
