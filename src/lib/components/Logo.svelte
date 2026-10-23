<script>
  import logo from '#lib/assets/logo.svg'
  import { siteConfig } from '#lib/config.js'
  import { HOME_HREF } from '#lib/utils/url.js'
  import NavLink from './NavLink.svelte'
</script>

<div class="m-0 text-base font-bold leading-tight -tracking-[0.5px]">
  <NavLink href={HOME_HREF} variant="logo">
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
    <span class="sr-only tracking-wide sm:not-sr-only">{siteConfig.title}</span>
  </NavLink>
</div>
