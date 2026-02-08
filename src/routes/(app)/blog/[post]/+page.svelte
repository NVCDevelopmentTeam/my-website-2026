<script>
	import { siteConfig } from '$lib/config';
	import PostDate from '$lib/components/PostDate.svelte';
	import PostAuthor from '$lib/components/PostAuthor.svelte';
	import PostCategories from '$lib/components/PostCategories.svelte';
	import PostTags from '$lib/components/PostTags.svelte';
	import LikeAndShare from '$lib/components/LikeAndShare.svelte';
	import ToC from '$lib/components/ToC.svelte';
	import FAQ from '$lib/components/FAQ.svelte';
	import PostNavigation from '$lib/components/PostNavigation.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { getSeoConfig } from '$lib/utils/seo';

	const { data } = $props();
	const { content: PostContent, metadata } = $derived.by(() => data);

	const faqs = $derived(metadata?.faqs || []);
	const hasToc = $derived(metadata?.toc && metadata.toc.length > 0);

	let contentRef = $state();
	let tocRef = $state();

	// 🎯 Inject TOC between intro and first heading
	// Using $effect to ensure it runs on navigation when metadata changes
	$effect(() => {
		if (metadata && contentRef && tocRef && hasToc) {
			const firstHeading = contentRef.querySelector('h2, h3, h4, h5, h6');
			
			if (firstHeading) {
				// Find all paragraphs before first heading (intro section)
				let introParas = [];
				let currentElement = contentRef.firstElementChild;
				
				while (currentElement && currentElement !== firstHeading) {
					if (currentElement.tagName === 'P') {
						introParas.push(currentElement);
					}
					currentElement = currentElement.nextElementSibling;
				}

				// Insert TOC after last intro paragraph, before first heading
				if (introParas.length > 0) {
					const lastIntroPara = introParas[introParas.length - 1];
					lastIntroPara.after(tocRef);
				} else {
					// No intro, insert before first heading
					firstHeading.before(tocRef);
				}
			} else {
				// No heading found, just put it at the end of the content section or keep at top
				contentRef.prepend(tocRef);
			}

			// Make TOC visible immediately
			tocRef.classList.remove('hidden');
		}
	});

	const seoConfig = $derived(
		getSeoConfig({
			title: metadata?.title,
			description: metadata?.description,
			url: `/blog/${metadata?.slug}`,
			image: metadata?.image,
			type: 'article',
			article: {
				publishedTime: metadata?.date,
				modifiedTime: metadata?.updated || metadata?.date,
				author: metadata?.author || siteConfig.author.name,
				tags: metadata?.tags || []
			}
		})
	);
</script>

<SEO {...seoConfig} />

<!-- Structured Data for Article -->
<svelte:head>
	{#if metadata}
		<script type="application/ld+json">
			{JSON.stringify({
				"@context": "https://schema.org",
				"@type": "BlogPosting",
				"headline": metadata.title,
				"description": metadata.description,
				"image": metadata.image ? `${siteConfig.url}${metadata.image}` : `${siteConfig.url}/og-image.png`,
				"datePublished": metadata.date,
				"dateModified": metadata.updated || metadata.date,
				"author": {
					"@type": "Person",
					"name": metadata.author || siteConfig.author.name,
					"url": siteConfig.url
				},
				"publisher": {
					"@type": "Organization",
					"name": siteConfig.title,
					"logo": {
						"@type": "ImageObject",
						"url": `${siteConfig.url}/logo.png`
					}
				},
				"mainEntityOfPage": {
					"@type": "WebPage",
					"@id": `${siteConfig.url}/blog/${metadata.slug}`
				},
				"keywords": metadata.tags?.join(', ') || '',
				"articleSection": metadata.categories?.[0] || 'Blog',
				"wordCount": metadata.wordCount || 0,
				"timeRequired": `PT${metadata.readingTime || 5}M`
			})}
		</script>
		
		<!-- Canonical URL -->
		<link rel="canonical" href="{siteConfig.url}/blog/{metadata.slug}" />
	{/if}
</svelte:head>

<div class="px-4 sm:px-6">
	{#if metadata}
		<article 
			class="py-10 animate-fade-in"
			itemscope 
			itemtype="https://schema.org/BlogPosting"
		>
			<header class="mb-10 space-y-6">
				<!-- Title -->
				<h1
					class="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 dark:text-white leading-tight tracking-tight"
					itemprop="headline"
				>
					{metadata.title}
				</h1>

				<!-- Meta info -->
				<div
					class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-950 dark:text-gray-50 font-bold"
				>
					<span itemprop="author" itemscope itemtype="https://schema.org/Person">
						<meta itemprop="name" content={metadata.author || siteConfig.author.name} />
						<PostAuthor post={{ metadata }} />
					</span>
					<span aria-hidden="true" class="text-gray-300 dark:text-gray-700">|</span>
					<time itemprop="datePublished" datetime={metadata.date}>
						<PostDate post={{ metadata }} />
					</time>
					{#if metadata.updated}
						<meta itemprop="dateModified" content={metadata.updated} />
					{/if}
					<span aria-hidden="true" class="text-gray-300 dark:text-gray-700">|</span>
					<PostCategories post={{ metadata }} />
					<span aria-hidden="true" class="text-gray-300 dark:text-gray-700">|</span>
					<span class="font-bold text-gray-950 dark:text-gray-200">
						<span itemprop="timeRequired" content="PT{metadata.readingTime}M">
							{metadata.readingTime} phút đọc
						</span>
					</span>
				</div>

				<div class="flex items-center pt-2">
					<LikeAndShare />
				</div>
				
				<!-- Hidden meta for SEO -->
				<meta itemprop="image" content={metadata.image || '/og-image.png'} />
				<meta itemprop="description" content={metadata.description} />
			</header>

			<!-- Post content with TOC auto-injected -->
			<section
				bind:this={contentRef}
				class="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-black prose-headings:text-gray-950 dark:prose-headings:text-white prose-p:text-gray-950 dark:prose-p:text-gray-50 prose-a:text-sky-900 dark:prose-a:text-sky-400 prose-a:font-bold prose-img:rounded-[2rem] prose-img:shadow-2xl prose-strong:text-gray-950 dark:prose-strong:text-white prose-li:text-gray-950 dark:prose-li:text-gray-50 prose-ul:text-gray-950 dark:prose-ul:text-gray-50 prose-ol:text-gray-950 dark:prose-ol:text-gray-50"
				itemprop="articleBody"
			>
				<PostContent />
			</section>

			<!-- TOC placeholder - will be injected into content -->
			{#if hasToc}
				<nav bind:this={tocRef} class="my-10 not-prose hidden" aria-label="Mục lục bài viết">
					<ToC post={{ metadata }} />
				</nav>
			{/if}

			{#if faqs.length > 0}
				<div class="mt-20 not-prose">
					<FAQ items={faqs} />
				</div>
			{/if}

			<footer class="mt-16 space-y-10">
				<!-- Tags -->
				<div class="pt-8 border-t border-gray-100 dark:border-gray-800">
					<PostTags post={{ metadata }} />
				</div>

				<PostNavigation post={{ metadata }} />
			</footer>
		</article>
	{/if}
</div>