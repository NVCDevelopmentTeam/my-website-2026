<script>
  import { onNavigate } from '$app/navigation'
  import Header from '$lib/components/Header.svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte'

  let { children, data } = $props()

  let isLoading = $state(false)

  // Cache View Transitions API support detection once (avoid repeated DOM reads)
  const supportsViewTransitions =
    typeof document !== 'undefined' && 'startViewTransition' in document

  // View Transitions API integration — BF-cache safe (no beforeunload/unload)
  onNavigate(function (navigation) {
    isLoading = true

    if (!supportsViewTransitions) {
      // Still track loading state even without VT support
      navigation.complete.then(() => {
        isLoading = false
      })
      return
    }

    return new Promise(function (resolve) {
      document.startViewTransition(async function () {
        resolve()
        await navigation.complete
        isLoading = false
      })
    })
  })
</script>

<div
  class="relative flex min-h-screen flex-col bg-white transition-colors duration-300 dark:bg-gray-950"
>
  <!-- Navigation progress bar — uses transform (compositor-only, no reflow) -->
  {#if isLoading}
    <div
      class="fixed top-0 right-0 left-0 z-[9999] h-1 bg-sky-600 dark:bg-sky-400"
      style="contain: strict;"
    >
      <div
        class="animate-progress h-full w-full origin-left bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
      ></div>
    </div>
  {/if}

  <Header allPages={data.allPages} navPages={data.navPages} />

  <div class="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
    <Breadcrumbs
      allPages={data.allPages}
      categories={data.allCategories}
      tags={data.allTags}
      recentPosts={data.recentPosts}
    />
  </div>

  <main id="main-content" class="mx-auto w-full max-w-7xl flex-grow px-4 sm:px-6 lg:px-8">
    <div class="py-12 lg:grid lg:grid-cols-12 lg:gap-12">
      <div
        class="transition-opacity duration-150 lg:col-span-8 {isLoading
          ? 'opacity-90'
          : 'opacity-100'}"
      >
        {@render children?.()}
      </div>
      <aside class="mt-12 lg:col-span-4 lg:mt-0">
        <Sidebar categories={data.allCategories} recentPosts={data.recentPosts} />
      </aside>
    </div>
  </main>
  <Footer pages={data.allPages} />
</div>
