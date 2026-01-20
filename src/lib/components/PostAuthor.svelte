<script>
  import { siteConfig } from '$lib/config';
  const { post } = $props();
  
  // Get author name, fallback to siteConfig if not available
  const author = $derived.by(() => post?.metadata?.author || siteConfig.author.name);
</script>

<div class="flex items-center gap-2 px-4 py-1 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 transition-colors">
  <div class="w-6 h-6 bg-gradient-to-br from-sky-400 to-violet-500 shape-organic-1 flex-shrink-0 shadow-sm" aria-hidden="true"></div>
  <p class="text-sm text-gray-600 dark:text-gray-300">
    <span class="font-medium">{author}</span>
  </p>
</div>
