<script>
	import { page } from '$app/state'
	import logo from '$lib/assets/logo.svg'
	import { siteConfig } from '$lib/config'

	// Accept both formats: array or object with pages property
	const { pages: pagesInput = [] } = $props();
	
	// Normalize to array format
	const pages = $derived.by(() => {
		// If pagesInput is already an array, use it
		if (Array.isArray(pagesInput)) return pagesInput;
		// If it's an object with pages property, extract it
		if (pagesInput?.pages && Array.isArray(pagesInput.pages)) return pagesInput.pages;
		// Fallback to empty array
		return [];
	});

	// Find the markdown page considered as the "home page"
	const homePage = $derived.by(() => {
		return pages.find(
			(p) =>
				p.slug === 'index' ||
				p.slug === '' ||
				p.metadata?.title?.toLowerCase() === 'trang chủ'
		);
	});

	// If there is an empty slug or index, the href must be "/"
	const homeHref = $derived.by(() => {
		return homePage && (homePage.slug === 'index' || homePage.slug === '')
			? '/'
			: homePage
			? `/${homePage.slug}`
			: '/';
	});
</script>

<p class="m-0 text-base font-bold -tracking-[0.5px] leading-tight">
	<a
		href={homeHref}
		class="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-gray-100 hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-full p-2"
		aria-label={siteConfig.title}
		aria-current={page.url.pathname === homeHref ? 'page' : undefined}
	>
		<img
			src={logo}
			alt="Logo trái tim Coding Nguyễn"
			class="w-9 h-9 rounded-full shadow-md 
				animate-[pulse_2s_ease-in-out_infinite] 
				transition-all duration-500 ease-out 
				hover:scale-110 
				hover:shadow-[0_0_15px_3px_rgba(255,215,0,0.6)] 
				dark:hover:shadow-[0_0_15px_3px_rgba(255,215,0,0.4)]"
			loading="lazy"
			decoding="async"
			draggable="false"
		/>

		<span class="hidden sm:inline tracking-wide">{siteConfig.title}</span>
	</a>
</p>