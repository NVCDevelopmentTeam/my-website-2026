<script>
  import { page } from '$app/state';
  import { siteConfig } from '$lib/config';
  import { serializeSchema } from '$lib/utils/seo';

  let { allPages = [], recentPosts = [], categories = [], tags = [] } = $props();

  // Mapping for fixed segment names (Vietnamese)
  const NAME_MAPPING = {
    'home': 'Trang chủ',
    'blog': 'Blog',
    'category': 'Danh mục',
    'tag': 'Thẻ',
    'contact': 'Liên hệ',
    'about': 'Giới thiệu',
    'archive': 'Lưu trữ',
    'search': 'Tìm kiếm'
  };

  /**
   * Find post/page by slug - search in ALL data sources
   */
  function findContentBySlug(segment, currentPath) {
    const fullPath = currentPath.substring(1); // Remove leading slash
    
    // Helper function to check slug match
    const isSlugMatch = (itemSlug) => {
      if (!itemSlug) return false;
      
      // Normalize slug (remove leading/trailing slashes)
      const normalizedSlug = itemSlug.replace(/^\/+|\/+$/g, '');
      const normalizedPath = fullPath.replace(/^\/+|\/+$/g, '');
      
      // Case 1: Exact match with segment
      if (normalizedSlug === segment) return true;
      
      // Case 2: Exact match with full path
      if (normalizedSlug === normalizedPath) return true;
      
      // Case 3: Path ends with slug
      if (normalizedPath.endsWith('/' + normalizedSlug) || normalizedPath === normalizedSlug) return true;
      
      // Case 4: Slug ends with segment (for nested paths)
      if (normalizedSlug.endsWith('/' + segment)) return true;
      
      // Case 5: Last segment match
      const slugLastSegment = normalizedSlug.split('/').pop();
      if (slugLastSegment === segment) return true;
      
      return false;
    };

    // 1. Search in recentPosts (blog posts)
    if (recentPosts && recentPosts.length > 0) {
      const matchedPost = recentPosts.find(p => isSlugMatch(p.slug || p.path));
      if (matchedPost?.metadata?.title) {
        return matchedPost.metadata.title;
      }
    }

    // 2. Search in allPages (static pages)
    if (allPages && allPages.length > 0) {
      const matchedPage = allPages.find(p => isSlugMatch(p.slug || p.path));
      if (matchedPage?.metadata?.title) {
        return matchedPage.metadata.title;
      }
    }

    // 3. Search in categories
    if (categories && categories.length > 0) {
      const matchedCategory = categories.find(cat => {
        const cSlug = cat.metadata?.slug || cat.slug || cat.title?.toLowerCase();
        return isSlugMatch(cSlug);
      });
      if (matchedCategory) {
        return matchedCategory.metadata?.title || matchedCategory.title || matchedCategory.name;
      }
    }

    // 4. Search in tags
    if (tags && tags.length > 0) {
      const matchedTag = tags.find(tag => {
        const tSlug = tag.slug || tag.name?.toLowerCase() || tag.title?.toLowerCase();
        return isSlugMatch(tSlug);
      });
      if (matchedTag) {
        return matchedTag.title || matchedTag.name || matchedTag.metadata?.title;
      }
    }

    return null;
  }

  /**
   * Beautify Vietnamese slug to readable text
   */
  function beautifySlug(slug) {
    try {
      const decoded = decodeURIComponent(slug);
      
      // Split by hyphen and capitalize each word
      const words = decoded.split('-');
      const beautified = words
        .map(word => {
          // Keep common lowercase words as is
          const lowercase = ['và', 'của', 'cho', 'từ', 'với', 'trong', 'ngoài', 'trên', 'dưới'];
          if (lowercase.includes(word.toLowerCase())) {
            return word.toLowerCase();
          }
          // Capitalize first letter
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
      
      return beautified;
    } catch {
      return slug.charAt(0).toUpperCase() + slug.slice(1);
    }
  }

  /**
   * Find display name for a segment - prioritize Vietnamese titles
   */
  function getSegmentName(segment, currentPath, isLastSegment) {
    // 1. Check fixed mapping first (highest priority)
    if (NAME_MAPPING[segment]) {
      return NAME_MAPPING[segment];
    }

    // 2. If it's the last segment, try to get from page.data first
    if (isLastSegment) {
      // Try all possible data structures from page.data
      const possibleTitles = [
        page.data?.post?.metadata?.title,      // Blog post
        page.data?.page?.metadata?.title,      // Static page
        page.data?.metadata?.title,            // Direct metadata
        page.data?.title,                      // Direct title
        page.data?.category?.name,             // Category page
        page.data?.tag?.name,                  // Tag page
        page.data?.categoryData?.name,         // Alternative category structure
        page.data?.tagData?.name               // Alternative tag structure
      ];

      for (const title of possibleTitles) {
        if (title && typeof title === 'string' && title.trim() !== '') {
          return title;
        }
      }
    }

    // 3. Search in all data sources (posts, pages, categories, tags)
    const foundTitle = findContentBySlug(segment, currentPath);
    if (foundTitle) {
      return foundTitle;
    }

    // 4. Final fallback: Beautify the slug for Vietnamese readability
    return beautifySlug(segment);
  }

  /**
   * Build breadcrumb items from pathname
   */
  const crumbs = $derived.by(() => {
    const path = page.url.pathname;
    
    // Home page doesn't need breadcrumbs
    if (path === '/') return [];

    const segments = path.split('/').filter(Boolean);
    const result = [{ name: 'Trang chủ', href: '/' }]; // Vietnamese "Home"

    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLastSegment = index === segments.length - 1;
      
      // Skip 'page' segment in pagination URLs
      if (segment === 'page') return;
      
      // Skip numeric pagination numbers
      if (!isNaN(parseInt(segment)) && segments[index - 1] === 'page') return;
      
      result.push({
        name: getSegmentName(segment, currentPath, isLastSegment),
        href: currentPath,
        isActive: isLastSegment
      });
    });

    return result;
  });

  /**
   * Generate JSON-LD schema for breadcrumbs (SEO)
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
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html serializeSchema(breadcrumbJsonLd)}
  {/if}
</svelte:head>

{#if crumbs.length > 0}
  <nav 
    class="flex py-4 px-4 sm:px-6 mb-6 overflow-x-auto whitespace-nowrap"
  >
    <ol class="flex items-center space-x-2 text-sm text-gray-950 dark:text-gray-50">
      {#each crumbs as crumb, i (crumb.href)}
        <li class="flex items-center">
          <!-- Separator icon -->
          {#if i > 0}
            <svg 
              class="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-600 mx-2" 
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
          
          <!-- Current page (no link) -->
          {#if crumb.isActive}
            <span 
              class="font-black text-gray-950 dark:text-gray-50 truncate max-w-[200px] sm:max-w-md" 
              aria-current="page"
              title={crumb.name}
            >
              {crumb.name}
            </span>
          <!-- Link to previous pages -->
          {:else}
            <a 
              href={crumb.href} 
              data-sveltekit-preload-data="hover"
              class="font-bold text-gray-950 dark:text-gray-50 hover:text-sky-800 dark:hover:text-sky-400 transition-colors"
              title={crumb.name}
            >
              {crumb.name}
            </a>
          {/if}
        </li>
      {/each}
    </ol>
  </nav>
{/if}
