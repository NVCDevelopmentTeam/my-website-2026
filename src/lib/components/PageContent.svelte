<script>
	import { page } from '$app/state';
	import { siteConfig } from '$lib/config';
	import FAQ from './FAQ.svelte';
	import SEO from './SEO.svelte';
	import { getSeoConfig } from '$lib/utils/seo';

	// Receive `data` prop from parent load() result
	let { data } = $props();

	const PageContent = $derived(data?.content || null);
	const metadata = $derived(data?.metadata || {});

	// FAQs array (may be undefined)
	const faqs = $derived(Array.isArray(metadata?.faqs) ? metadata.faqs : []);

	// SEO configuration
	const seoConfig = $derived(
		getSeoConfig({
			title: metadata?.title || siteConfig.title,
			description: metadata?.description || siteConfig.description,
			url: page.url.pathname
		})
	);
</script>

<SEO {...seoConfig} />

<section
	class="prose prose-neutral dark:prose-invert max-w-none px-4 py-10 prose-headings:text-gray-950 dark:prose-headings:text-white prose-p:text-gray-950 dark:prose-p:text-gray-50 prose-a:text-sky-900 dark:prose-a:text-sky-400 prose-a:font-bold prose-strong:text-gray-950 dark:prose-strong:text-white prose-li:text-gray-950 dark:prose-li:text-gray-50 prose-ul:text-gray-950 dark:prose-ul:text-gray-50 prose-ol:text-gray-950 dark:prose-ol:text-gray-50"
>
	{#if PageContent}
		<PageContent />
	{/if}

	{#if faqs.length > 0}
		<div class="not-prose mt-16">
			<FAQ items={faqs} />
		</div>
	{/if}
</section>
