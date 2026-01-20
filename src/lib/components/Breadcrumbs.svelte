<script>
  import { page } from '$app/state';
  import { siteConfig } from '$lib/config';

  let { allPages, posts = [] } = $props();

  // Mapping cho các tên cố định
  const NAME_MAPPING = {
    'blog': 'Bài viết',
    'category': 'Danh mục',
    'tag': 'Từ khóa',
    'contact': 'Liên hệ',
    'about': 'Giới thiệu'
  };

  /**
   * Tìm tên hiển thị cho một segment
   */
  function getSegmentName(segment, currentPath, isLastSegment) {
    // 1. Kiểm tra mapping cố định trước
    if (NAME_MAPPING[segment]) {
      return NAME_MAPPING[segment];
    }

    // 2. Nếu là segment cuối và có post/page data từ page.data, lấy title
    if (isLastSegment && page.data.post?.metadata?.title) {
      return page.data.post.metadata.title;
    }

    // Chuẩn hóa path để so sánh
    const fullPath = currentPath.substring(1); // Bỏ dấu / đầu: "/blog/demo" -> "blog/demo"
    
    // 3. Tìm trong posts array
    // Posts có thể có slug dạng: "demo", "blog/demo", "category/slug" etc.
    const matchedPost = posts.find(p => {
      const postSlug = p.slug;
      
      // Case 1: Slug trùng khớp hoàn toàn với segment hiện tại
      if (postSlug === segment) return true;
      
      // Case 2: Slug trùng với full path (vd: slug = "blog/demo", fullPath = "blog/demo")
      if (postSlug === fullPath) return true;
      
      // Case 3: Full path kết thúc bằng slug (vd: slug = "demo", fullPath = "blog/demo")
      if (fullPath.endsWith('/' + postSlug) || fullPath === postSlug) return true;
      
      // Case 4: Slug có chứa path separator và kết thúc bằng segment
      if (postSlug.includes('/') && postSlug.endsWith('/' + segment)) return true;
      
      return false;
    });
    
    if (matchedPost?.metadata?.title) {
      return matchedPost.metadata.title;
    }

    // 4. Tìm trong allPages array
    const matchedPage = allPages.find(p => {
      const pageSlug = p.slug;
      
      if (pageSlug === segment) return true;
      if (pageSlug === fullPath) return true;
      if (fullPath.endsWith('/' + pageSlug) || fullPath === pageSlug) return true;
      if (pageSlug.includes('/') && pageSlug.endsWith('/' + segment)) return true;
      
      return false;
    });
    
    if (matchedPage?.metadata?.title) {
      return matchedPage.metadata.title;
    }

    // 5. Fallback: capitalize segment (không tìm thấy gì)
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }

  /**
   * Build breadcrumb items từ pathname
   */
  const crumbs = $derived.by(() => {
    const path = page.url.pathname;
    
    // Trang chủ không cần breadcrumbs
    if (path === '/') return [];

    const segments = path.split('/').filter(Boolean);
    const result = [{ name: 'Trang chủ', href: '/' }];

    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLastSegment = index === segments.length - 1;
      
      result.push({
        name: getSegmentName(segment, currentPath, isLastSegment),
        href: currentPath
      });
    });

    return result;
  });

  /**
   * Generate JSON-LD schema cho breadcrumbs
   */
  const breadcrumbJsonLd = $derived.by(() => {
    if (crumbs.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': crumb.name,
        'item': `${siteConfig.siteUrl}${crumb.href === '/' ? '' : crumb.href}`
      }))
    };
  });
</script>

<svelte:head>
  {#if breadcrumbJsonLd}
    {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>`}
  {/if}
</svelte:head>

{#if crumbs.length > 0}
  <nav 
    aria-label="Đường dẫn" 
    class="flex py-4 px-4 sm:px-6 mb-6 overflow-x-auto whitespace-nowrap"
  >
    <ol class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
      {#each crumbs as crumb, i (crumb.href)}
        <li class="flex items-center">
          <!-- Separator icon -->
          {#if i > 0}
            <svg 
              class="flex-shrink-0 h-5 w-5 text-gray-300 dark:text-gray-600 mx-2" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path 
                fill-rule="evenodd" 
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                clip-rule="evenodd" 
              />
            </svg>
          {/if}
          
          <!-- Current page (không link) -->
          {#if i === crumbs.length - 1}
            <span 
              class="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px] sm:max-w-md" 
              aria-current="page"
            >
              {crumb.name}
            </span>
          <!-- Link đến các trang trước -->
          {:else}
            <a 
              href={crumb.href} 
              class="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              {crumb.name}
            </a>
          {/if}
        </li>
      {/each}
    </ol>
  </nav>
{/if}