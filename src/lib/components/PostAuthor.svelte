<script>
  import { siteConfig } from '$lib/config';
  const { post } = $props();
  
  // Get author name, fallback to siteConfig if not available
  const author = $derived.by(() => post?.metadata?.author || siteConfig.author.name);
</script>

<p class="text-sm text-gray-600 px-4">Viết bởi:
<span>{author}</span></p>
