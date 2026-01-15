<script>
  import { page } from '$app/state';

  /**
   * @typedef {Object} Props
   * @property {any[]} [pages] - Danh sách đầy đủ các trang Markdown từ layout
   */
  let { pages = [] } = $props();

  // Lọc lấy các trang dành cho Footer dựa trên metadata
  let footerPages = $derived(pages.filter(p => p.metadata?.menu === 'footer'));

  /**
   * Chuyển đổi slug thành URL. 
   * Giống hệt logic Menu chính của bạn để đảm bảo tính đồng nhất.
   */
  function getHref(slug) {
    return slug === 'index' || slug === '' ? '/' : `/${slug}`;
  }

  function isCurrentPage(slug) {
    const href = getHref(slug);
    return page.url.pathname === href;
  }
</script>

{#if footerPages.length > 0}
  <nav aria-label="Liên kết pháp lý" class="flex flex-wrap gap-4 md:gap-8 justify-center mt-8">
    {#each footerPages as p (p.slug)}
      <a
        href={getHref(p.slug)}
        class="text-sm text-gray-500 hover:text-orange-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-sm"
        class:font-bold={isCurrentPage(p.slug)}
        aria-current={isCurrentPage(p.slug) ? 'page' : undefined}
      >
        {p.metadata.title}
      </a>
    {/each}
  </nav>
{/if}