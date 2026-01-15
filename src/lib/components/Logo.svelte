<script>
	import { page } from '$app/state';
	import logo from '$lib/assets/logo.svg';
	import { siteConfig } from '$lib/config';

	// Receive explicit pages prop from Header
	let { pages = [] } = $props();

	// Find the home page href using a clean derived state
	const homeHref = $derived.by(() => {
		const homePage = pages.find(
			(p) => p.slug === 'index' || p.slug === '' || p.metadata?.title?.toLowerCase() === 'trang chủ'
		);
		if (homePage && (homePage.slug === 'index' || homePage.slug === '')) return '/';
		return homePage ? `/${homePage.slug}` : '/';
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
			alt="Logo {siteConfig.title}"
			class="w-9 h-9 rounded-full shadow-md transition-all duration-500 hover:scale-110"
			loading="lazy"
			decoding="async"
		/>
		<span class="hidden sm:inline tracking-wide">{siteConfig.title}</span>
	</a>
</p>