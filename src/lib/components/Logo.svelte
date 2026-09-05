<script>
  import { page } from '$app/state'
  import { siteConfig } from '$lib/config'

  // Receive explicit pages prop from Header
  let { pages = [] } = $props()

  // Find the home page href using a clean derived state
  const homeHref = $derived.by(() => {
    const homePage = pages.find(
      (p) => p.slug === 'index' || p.slug === '' || p.metadata?.title?.toLowerCase() === 'trang chủ'
    )
    if (homePage && (homePage.slug === 'index' || homePage.slug === '')) return '/'
    return homePage ? `/${homePage.slug}` : '/'
  })
</script>

<div class="m-0 text-base font-bold leading-tight -tracking-[0.5px]">
  <a
    href={homeHref}
    data-sveltekit-preload-data="hover"
    class="min-h-[48px] min-w-[48px] flex items-center gap-2 rounded-full p-1.5 text-lg text-gray-950 font-bold transition-colors duration-300 dark:text-gray-50 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-800 dark:hover:text-sky-400 dark:focus:ring-sky-400"
    aria-label={siteConfig.title}
    aria-current={page.url.pathname === homeHref ? 'page' : undefined}
  >
    <!-- 
			Performance optimization:
			- Inlined SVG to eliminate network request
			- Explicit width/height to prevent CLS
		-->
    <div
      class="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full from-amber-200 to-orange-300 bg-gradient-to-br object-cover shadow-md transition-[transform,shadow] duration-500 hover:scale-110"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width="36"
        height="36"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f6d365;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#fda085;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="url(#logo-grad)" />
        <circle cx="50" cy="50" r="30" fill="white" opacity="0.3" />
        <path
          d="M50 20 L50 30 M50 70 L50 80 M20 50 L30 50 M70 50 L80 50 M28.8 28.8 L35.9 35.9 M64.1 64.1 L71.2 71.2 M28.8 71.2 L35.9 64.1 M64.1 28.8 L71.2 35.9"
          stroke="white"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <span class="hidden tracking-wide sm:inline">{siteConfig.title}</span>
  </a>
</div>
