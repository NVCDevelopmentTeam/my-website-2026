<script>
  import PageContent from '$lib/components/PageContent.svelte';
  import RecentPosts from '$lib/components/RecentPosts.svelte';

  let { data } = $props();
  
  // Access latestPosts from layout data if available, or through data prop
  // In SvelteKit, leaf nodes receive combined data from all layouts
  const latestPosts = $derived(data?.latestPosts || []);
  const featuredPosts = $derived(latestPosts.filter(p => p.metadata.featured).slice(0, 3));
</script>

<div class="space-y-16 pb-20">
  <!-- Hero / Intro Section -->
  <section class="animate-fade-in">
    <PageContent {data} />
  </section>

  {#if featuredPosts.length > 0}
    <!-- Featured Posts Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 animate-slide-up" style="animation-delay: 0.2s">
      <div class="flex items-center gap-4 mb-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Nổi bật
        </h2>
        <div class="h-px flex-grow bg-gradient-to-r from-amber-400 to-transparent"></div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each featuredPosts as post (post.slug)}
          <article class="group relative bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
            <div class="absolute top-0 right-0 p-4">
              <span class="flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>
            
            <div class="space-y-4">
              <div class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                {post.metadata.categories[0] || 'Tâm đắc'}
              </div>
              
              <h3 class="text-xl font-bold text-gray-900 dark:text-white leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                <a href="/blog/{post.slug}">
                  <span class="absolute inset-0" aria-hidden="true"></span>
                  {post.metadata.title}
                </a>
              </h3>
              
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                {post.metadata.description}
              </p>
              
              <div class="pt-4 flex items-center text-sm font-bold text-gray-900 dark:text-white group-hover:gap-2 transition-all">
                Đọc ngay 
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1 opacity-0 group-hover:opacity-100 transition-all"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </div>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Recent Posts Section -->
  <section class="max-w-4xl mx-auto px-4 sm:px-6 animate-slide-up" style="animation-delay: 0.4s">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        Mới nhất
      </h2>
      <a href="/blog" class="text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline">
        Xem tất cả bài viết →
      </a>
    </div>
    
    <RecentPosts {latestPosts} />
  </section>

  <!-- Newsletter / Call to action - Vietnamese optimized -->
  <section class="max-w-4xl mx-auto px-4 animate-slide-up" style="animation-delay: 0.6s">
    <div class="bg-gradient-to-br from-sky-500 to-violet-600 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl shadow-sky-500/20">
      <h2 class="text-3xl md:text-4xl font-bold mb-6">Bạn không muốn bỏ lỡ điều gì chứ?</h2>
      <p class="text-sky-100 mb-10 max-w-lg mx-auto leading-relaxed">
        Ghé thăm mình thường xuyên hơn hoặc liên hệ trực tiếp nếu bạn muốn cùng thảo luận về một chủ đề nào đó nhé!
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/contact" class="px-8 py-4 bg-white text-sky-600 font-bold rounded-2xl hover:bg-sky-50 transition-colors shadow-lg shadow-black/10">
          Liên hệ với mình
        </a>
        <a href="/blog" class="px-8 py-4 bg-sky-400/20 text-white font-bold rounded-2xl border border-white/30 hover:bg-sky-400/30 transition-colors">
          Xem blog
        </a>
      </div>
    </div>
  </section>
</div>