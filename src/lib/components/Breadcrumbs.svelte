<script>
  import { page } from '$app/state';
  import { siteConfig } from '$lib/config';

    let { allPages = [], recentPosts = [], categories = [], tags = [] } = $props();

      // Mapping for fixed names
      const NAME_MAPPING = {
        'blog': 'Blog',
        'category': 'Danh mục',
        'tag': 'Thẻ',
        'contact': 'Liên hệ',
        'about': 'Giới thiệu'
      };

    /**
     * Find content (post/page) by slug - searches ALL data sources
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
          return isSlugMatch(cat.slug || cat.title?.toLowerCase());
        });
        if (matchedCategory?.title) {
          return matchedCategory.title;
        }
      }
  
      // 4. Search in tags
      if (tags && tags.length > 0) {
        const matchedTag = tags.find(tag => {
          return isSlugMatch(tag.slug || tag.title?.toLowerCase());
        });
        if (matchedTag?.title) {
          return matchedTag.title;
        }
      }
  
      return null;
    }
  
    /**
     * Find display name for a segment
     */
    function getSegmentName(segment, currentPath, isLastSegment) {
      // 1. Check fixed mapping first
      if (NAME_MAPPING[segment]) {
        return NAME_MAPPING[segment];
      }
  
      // 2. If it's the last segment, try to get data directly from page.data
      if (isLastSegment) {
        // Prioritize page.data.post (for blog posts)
        if (page.data?.post?.metadata?.title) {
          return page.data.post.metadata.title;
        }
        
        // Get from page.data.page (for static pages)
        if (page.data?.page?.metadata?.title) {
          return page.data.page.metadata.title;
        }
        
        // Get from page.data itself
        if (page.data?.metadata?.title) {
          return page.data.metadata.title;
        }
  
        // Get directly from page.data.title
        if (page.data?.title) {
          return page.data.title;
        }
      }
  
      // 3. Search in data sources
      const foundTitle = findContentBySlug(segment, currentPath);
      if (foundTitle) {
        return foundTitle;
      }
  
      // 4. Fallback: capitalize segment and decode URI
      try {
        const decoded = decodeURIComponent(segment);
        return decoded.charAt(0).toUpperCase() + decoded.slice(1);
      } catch {
        return segment.charAt(0).toUpperCase() + segment.slice(1);
      }
    }
  
    /**
     * Build breadcrumb items from pathname
     */
    const crumbs = $derived.by(() => {
      const path = page.url.pathname;
      
      // Homepage doesn't need breadcrumbs
      if (path === '/') return [];
  
      const segments = path.split('/').filter(Boolean);
      const result = [{ name: 'Trang chủ', href: '/' }];
  
      let currentPath = '';
      
      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLastSegment = index === segments.length - 1;
        
        result.push({
          name: getSegmentName(segment, currentPath, isLastSegment),
          href: currentPath,
          isActive: isLastSegment
        });
      });
  
      return result;
    });
  
    /**
     * Generate JSON-LD schema for breadcrumbs
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
      {@html '<script type="application/ld+json">' + JSON.stringify(breadcrumbJsonLd) + '</script>'}
    {/if}
  </svelte:head>
  
  {#if crumbs.length > 0}
    <nav 
      aria-label="Breadcrumb" 
      class="flex py-4 px-4 sm:px-6 mb-6 overflow-x-auto whitespace-nowrap"
    >
      <ol class="flex items-center space-x-2 text-sm text-gray-800 dark:text-gray-400">
        {#each crumbs as crumb, i (crumb.href)}
          <li class="flex items-center">
            <!-- Separator icon -->
            {#if i > 0}
              <svg 
                class="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-800 mx-2" 
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
                class="font-bold text-gray-950 dark:text-white truncate max-w-[200px] sm:max-w-md" 
                aria-current="page"
              >
                {crumb.name}
              </span>
            <!-- Links to previous pages -->
            {:else}
              <a 
                href={crumb.href} 
                class="font-medium hover:text-sky-800 dark:hover:text-sky-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-800 dark:focus:ring-sky-400 rounded-sm"
              >
                {crumb.name}
              </a>
            {/if}
          </li>
        {/each}
      </ol>
    </nav>
  {/if}
