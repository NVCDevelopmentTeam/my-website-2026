<script>
  import { siteConfig } from '$lib/config';
  const { post } = $props();
  
  // Get author name, fallback to siteConfig if not available
  const author = $derived.by(() => post?.metadata?.author || siteConfig.author.name);
</script>

<div class="flex items-center gap-1.5 transition-colors">
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500 dark:text-gray-400" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  <p class="text-sm text-gray-950 dark:text-gray-200 font-bold">
    <span>{author}</span>
  </p>
</div>
