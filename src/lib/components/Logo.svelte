<script>
  import { page } from '$app/state'
  import logo from '#lib/assets/logo.svg'
  import { siteConfig } from '#lib/config.js'

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
			- The logo is src/lib/assets/logo.svg (editable from the CMS). It is under Vite's 4 KB
			  inline limit, so it ships as a data URI: still no network request
			- Explicit width/height to prevent CLS
		-->
    <div
      class="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full from-amber-200 to-orange-300 bg-gradient-to-br object-cover shadow-md transition-[transform,shadow] duration-500 hover:scale-110"
    >
      <img src={logo} alt="" width="36" height="36" decoding="async" />
    </div>
    <span class="hidden tracking-wide sm:inline">{siteConfig.title}</span>
  </a>
</div>
