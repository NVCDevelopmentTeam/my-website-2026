<script>
  import { toLongDisplayDate } from '#lib/utils/date.js'

  const { post } = $props()
  const dateString = $derived(toLongDisplayDate(post.metadata.date))
</script>

<span class="inline-flex items-center gap-1.5">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="text-gray-800 dark:text-gray-300"
    aria-hidden="true"
    ><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line
      x1="16"
      y1="2"
      x2="16"
      y2="6"
    ></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"
    ></line></svg
  >
  <span class="text-sm text-gray-950 font-bold dark:text-gray-50">
    <time datetime={post.metadata.date}>
      {dateString}
    </time>
  </span>
</span>
