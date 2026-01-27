<script>
  import { siteConfig } from '$lib/config';
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Seo from 'sk-seo';
  import { defaultSeoConfig } from '$lib/utils/seo';

  /** @type {Object} Props */
  let { children, data } = $props();

</script>

<svelte:head>
  <title>{siteConfig.title}</title>
  <meta name="description" content={siteConfig.description} />
  <Seo {...defaultSeoConfig} />
</svelte:head>

<div class="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
  <Header allPages={data.allPages} navPages={data.navPages} />

  <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
    <Breadcrumbs 
      allPages={data.allPages}  
      categories={data.allCategories} 
      tags={data.allTags} 
      recentPosts={data.recentPosts} 
    />
  </div>

  <main id="main-content" class="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
    <div class="lg:grid lg:grid-cols-12 lg:gap-12 py-12">
      <div class="lg:col-span-8 animate-fade-in">
        {@render children?.()}
      </div>
      <aside class="lg:col-span-4 mt-12 lg:mt-0 animate-fade-in" style="animation-delay: 0.1s">
        <Sidebar categories={data.allCategories} recentPosts={data.recentPosts} />
      </aside>
    </div>
  </main>
  <Footer pages={data.allPages} />
</div>
