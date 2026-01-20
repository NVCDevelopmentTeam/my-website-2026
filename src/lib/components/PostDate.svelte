<script>
  const { post } = $props();
  const d = $derived.by(() => new Date(post.metadata.date));
  const day = $derived.by(() => d.getDate());
  const month = $derived.by(() => d.getMonth() + 1);
  const year = $derived.by(() => d.getFullYear());
</script>

<div class="flex items-center gap-2 px-4 py-1 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 transition-colors">
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
  <p class="text-sm text-gray-600 dark:text-gray-300">
    <time datetime={post.metadata.date}>
      {day} thg {month}, {year}
    </time>
  </p>
</div>
