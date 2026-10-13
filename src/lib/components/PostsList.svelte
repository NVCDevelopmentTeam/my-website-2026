<script>
  import PostDate from './PostDate.svelte'
  import PostAuthor from './PostAuthor.svelte'
  import PostCategories from './PostCategories.svelte'
  import PostPreview from './PostPreview.svelte'

  /** @type {{ posts?: any[], headingLevel?: 2 | 3 }} */
  let { posts = [], headingLevel = 2 } = $props()
</script>

<ul class="m-0 list-none p-0 space-y-8">
  {#each posts as post (post.slug)}
    <li
      class="group border border-gray-100 rounded-2xl bg-white p-5 shadow-sm transition duration-300 dark:border-gray-700 dark:bg-gray-800 sm:p-6 hover:shadow-xl"
    >
      <article class="h-full flex flex-col">
        <a href={`/blog/${post.slug}`} data-sveltekit-preload-data="hover" class="block space-y-3">
          <svelte:element
            this={`h${headingLevel}`}
            class="text-xl text-gray-950 font-black transition-colors sm:text-2xl dark:text-gray-50 group-hover:text-sky-800 dark:group-hover:text-sky-400"
          >
            {post.metadata.title}
          </svelte:element>
        </a>

        <div
          class="flex flex-wrap items-center gap-3 text-sm text-gray-950 font-bold dark:text-gray-50"
        >
          <PostAuthor {post} />
          <span class="h-1 w-1 rounded-full bg-current opacity-50" aria-hidden="true"></span>
          <PostDate {post} />
          <span class="h-1 w-1 rounded-full bg-current opacity-50" aria-hidden="true"></span>
          <PostCategories {post} />
        </div>

        <PostPreview {post} />
      </article>
    </li>
  {/each}
</ul>
