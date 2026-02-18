<script>
	import { navigating } from '$app/state';
	import { onNavigate } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	/** @type {Object} Props */
	let { children, data } = $props();

  const isLoading = $derived(!!navigating);

  // View Transitions API
  onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.completed;
			});
		});
	});
</script>

<div class="flex flex-col min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 relative">
  <!-- Progress Bar - Enhanced for "Vue-like" feel -->
  {#if isLoading}
    <div class="fixed top-0 left-0 right-0 h-1 bg-sky-600 dark:bg-sky-400 z-[9999]">
      <div class="h-full w-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-progress origin-left"></div>
    </div>
  {/if}

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
			<div 
        class="lg:col-span-8 transition-opacity duration-150 {isLoading ? 'opacity-90' : 'opacity-100'}"
      >
				{@render children?.()}
			</div>
			<aside class="lg:col-span-4 mt-12 lg:mt-0">
				<Sidebar 
					categories={data.allCategories} 
					recentPosts={data.recentPosts} 
				/>
			</aside>
		</div>
	</main>
	<Footer pages={data.allPages} />
</div>
