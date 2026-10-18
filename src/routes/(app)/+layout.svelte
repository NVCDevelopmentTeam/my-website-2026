<script>
  import { afterNavigate, onNavigate } from '$app/navigation'
  import { navigating } from '$app/state'
  import Header from '#lib/components/Header.svelte'
  import Sidebar from '#lib/components/Sidebar.svelte'
  import Footer from '#lib/components/Footer.svelte'
  import Breadcrumbs from '#lib/components/Breadcrumbs.svelte'

  let { children, data } = $props()

  // Progress bar only for page changes that are still loading after 250 ms (fast ones, the usual
  // case thanks to preloading, show nothing).
  let isSlow = $state(false)
  $effect(() => {
    if (!navigating.to) {
      isSlow = false
      return
    }
    const timer = setTimeout(() => {
      isSlow = true
    }, 250)
    return () => clearTimeout(timer)
  })

  // New page: announce "page title — site title" through one live region, the same way in a normal
  // window and in browser full screen (F11, where the tab strip and window title are hidden and
  // screen readers otherwise say nothing). SvelteKit's own announcer is hidden in layout.css so the
  // title is not read twice. A full page load in a normal window is already announced by the
  // browser, so only there the first load is skipped. The text is cleared afterwards so that it
  // does not stay at the start of the page for people reading it line by line.
  const inFullscreen = () =>
    !!document.fullscreenElement ||
    matchMedia('(display-mode: fullscreen)').matches ||
    (outerWidth >= screen.width && outerHeight >= screen.height)
  let arrivedTitle = $state('')
  /** @type {ReturnType<typeof setTimeout>} */
  let announceTimer
  afterNavigate((navigation) => {
    if (navigation.type === 'enter' && !inFullscreen()) return
    clearTimeout(announceTimer)
    arrivedTitle = ''
    announceTimer = setTimeout(() => {
      arrivedTitle = document.title
      announceTimer = setTimeout(() => (arrivedTitle = ''), 2000)
    }, 100)
  })

  // Cache View Transitions API support detection once (avoid repeated DOM reads)
  const supportsViewTransitions =
    typeof document !== 'undefined' && 'startViewTransition' in document

  // View Transitions API integration — BF-cache safe (no beforeunload/unload)
  onNavigate(function (navigation) {
    if (navigation.shallow || !supportsViewTransitions) return
    // No animation at all for people who asked for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    return new Promise(function (resolve) {
      document.startViewTransition(async function () {
        resolve()
        await navigation.complete
      })
    })
  })
</script>

<div
  class="relative min-h-screen flex flex-col bg-white lg:m-6 xl:mx-auto lg:min-h-[calc(100vh_-_3rem)] xl:max-w-[1400px] xl:w-[calc(100%_-_3rem)] lg:overflow-clip lg:rounded-2xl dark:bg-gray-950 lg:shadow-2xl"
>
  <!-- Navigation progress bar — uses transform (compositor-only, no reflow) -->
  {#if isSlow}
    <div
      class="fixed left-0 right-0 top-0 z-[9999] h-1 bg-sky-600 dark:bg-sky-400"
      style="contain: strict;"
      aria-hidden="true"
    >
      <div
        class="h-full w-full origin-left bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-progress"
      ></div>
    </div>
  {/if}

  <Header allPages={data.allPages} navPages={data.navPages} />

  <div class="mx-auto max-w-7xl w-full px-4 pt-4 lg:px-8 sm:px-6">
    <Breadcrumbs />
  </div>

  <main
    id="main-content"
    tabindex="-1"
    class="mx-auto max-w-7xl w-full flex-grow px-4 lg:px-8 sm:px-6 focus:outline-none"
  >
    <div class="py-12 md:grid md:grid-cols-12 md:gap-8 lg:gap-12">
      <div class="md:col-span-8">
        {@render children?.()}
      </div>
      <aside class="mt-12 md:col-span-4 md:mt-0">
        <Sidebar categories={data.allCategories} recentPosts={data.recentPosts} />
      </aside>
    </div>
  </main>
  <Footer pages={data.allPages} />

  <!-- Page title announcement (see script) -->
  <div role="status" class="sr-only">{arrivedTitle}</div>
</div>
