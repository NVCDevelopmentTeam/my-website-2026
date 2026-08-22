<script>
  import PostDate from './PostDate.svelte'
  import PostAuthor from './PostAuthor.svelte'
  import PostCategories from './PostCategories.svelte'
  import PostPreview from './PostPreview.svelte'

  let { posts = [] } = $props()
</script>

<ul class="space-y-8">
  {#each posts as post (post.slug)}
    <li
      class="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:shadow-xl sm:p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <article class="flex h-full flex-col">
        <a href={`/blog/${post.slug}`} data-sveltekit-preload-data="hover" class="block space-y-3">
          <h2
            class="text-xl font-black text-gray-950 transition-colors group-hover:text-sky-800 sm:text-2xl dark:text-gray-50 dark:group-hover:text-sky-400"
          >
            {post.metadata.title}
          </h2>
        </a>

        <div
          class="flex flex-wrap items-center gap-3 text-sm font-bold text-gray-950 dark:text-gray-50"
        >
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
