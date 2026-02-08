<script>
  let { recentPosts = [] } = $props()
  const hasPosts = $derived(recentPosts.length > 0)
</script>

{#if hasPosts}
  <ul class="list-none p-0 m-0 space-y-4">
    {#each recentPosts as post (post.slug)}
      <li class="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
        <a 
          href="/blog/{post.slug}" 
          
          class="text-base font-bold text-gray-950 dark:text-gray-50 hover:text-sky-700 dark:hover:text-sky-400 transition-colors duration-200 line-clamp-2 leading-snug"
        >
          {post.metadata.title}
        </a>
      </li>
    {/each}
  </ul>
{:else}
  <p class="text-sm text-gray-950 dark:text-gray-50 italic py-4">
    Chưa có bài viết nào được tìm thấy.
  </p>
{/if}
