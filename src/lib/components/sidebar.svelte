<script>
  import { siteConfig } from '$lib/config';
  import { page } from '$app/state';
  import SocialMenu from './SocialMenu.svelte';
  import RecentPosts from './RecentPosts.svelte';
  
  /** @type {Object} Props */
  let { recentPosts = [], categories = [] } = $props();

  // Hide recent posts if already on a listing page
  const isListingPage = $derived(
    page.url.pathname === '/' || 
    page.url.pathname === '/blog' || 
    page.url.pathname.startsWith('/blog/category') || 
    page.url.pathname.startsWith('/blog/tag')
  );
</script>

<aside class="space-y-10">
  <!-- Author Section -->
  <section class="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none">
    <h2 class="text-xl font-black text-gray-950 dark:text-white mb-6 flex items-center gap-3">
      <span class="w-8 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full"></span>
      Về {siteConfig.author.name}
    </h2>
    <div class="space-y-4">
      <p class="text-gray-800 dark:text-gray-200 leading-relaxed text-sm font-medium">
        Chào mừng bạn đến với <strong class="text-gray-950 dark:text-white font-black">{siteConfig.title}</strong>. Mình là <strong class="text-gray-950 dark:text-white font-black">{siteConfig.author.name}</strong>, người sáng tạo nội dung tại đây.
      </p>
      <p class="text-gray-800 dark:text-gray-200 leading-relaxed text-sm font-medium">
        {siteConfig.description}
      </p>
      <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
        <SocialMenu />
      </div>
    </div>
  </section>

  <!-- Recent Posts Section -->
  {#if recentPosts.length > 0 && !isListingPage}
    <section class="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none">
      <h2 class="text-xl font-black text-gray-950 dark:text-white mb-6 flex items-center gap-3">
        <span class="w-8 h-1.5 bg-emerald-700 dark:bg-emerald-400 rounded-full"></span>
        Bài viết mới nhất
      </h2>
      <RecentPosts {recentPosts} />
    </section>
  {/if}

  <!-- Categories Section (WordPress Style) -->
  {#if categories.length > 0}
    <section class="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none">
      <h2 class="text-xl font-black text-gray-950 dark:text-white mb-6 flex items-center gap-3">
        <span class="w-8 h-1.5 bg-sky-800 dark:bg-sky-400 rounded-full"></span>
        Danh mục
      </h2>
      <ul class="space-y-1">
        {#each categories as category (category.slug)}
          <li>
            <a 
              href="/blog/category/{category.slug}"
              class="flex items-center justify-between group py-3 px-4 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all duration-300"
            >
              <!-- Category name with count (WordPress style) -->
              <span class="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-sky-900 dark:group-hover:text-sky-300 transition-colors">
                {category.title}
              </span>
              <span class="text-xs font-black bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 px-2 py-1 rounded-lg group-hover:bg-sky-100 dark:group-hover:bg-sky-800 transition-colors">
                {category.count}
              </span>
            </a>
          </li>
        {/each}
      </ul>
      
      <!-- View all categories link -->
      <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <a 
          href="/blog/category"
          class="text-sm font-black text-sky-800 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 transition-colors inline-flex items-center gap-2 group"
        >
          Xem tất cả danh mục
          <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </section>
  {/if}

  <!-- AdSense Placeholder -->
  <section class="bg-gray-50 dark:bg-gray-950 p-8 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 text-center">
    <span class="text-xs text-gray-800 dark:text-gray-400 uppercase tracking-widest font-black">Quảng cáo</span>
    <div class="mt-6 min-h-[250px] flex items-center justify-center text-gray-700 dark:text-gray-700 text-sm italic font-medium">
      Vị trí hiển thị quảng cáo
    </div>
  </section>
</aside>

