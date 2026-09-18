<script>
  import { siteConfig } from '$lib/config'
  import PostDate from '$lib/components/PostDate.svelte'
  import PostAuthor from '$lib/components/PostAuthor.svelte'
  import PostCategories from '$lib/components/PostCategories.svelte'
  import PostTags from '$lib/components/PostTags.svelte'
  import LikeAndShare from '$lib/components/LikeAndShare.svelte'
  import ToC from '$lib/components/ToC.svelte'
  import FAQ from '$lib/components/FAQ.svelte'
  import PostNavigation from '$lib/components/PostNavigation.svelte'
  import SEO from '$lib/components/SEO.svelte'
  import { getSeoConfig } from '$lib/utils/seo'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'

  const { data } = $props()
  const { content: PostContent, metadata } = $derived.by(() => data)

  const faqs = $derived(metadata?.faqs || [])
  const hasToc = $derived(metadata?.toc && metadata.toc.length > 0)

  let views = $state(0)

  onMount(() => {
    if (browser && metadata) {
      const viewKey = `views_${metadata.slug || 'unknown'}`
      const currentViews = parseInt(localStorage.getItem(viewKey) || '0', 10)
      views = currentViews + 1
      localStorage.setItem(viewKey, views.toString())
    }
  })

  // Visual ordering of intro / ToC / main content is handled entirely by
  // CSS (see .post-intro-block / order-toc rules) — no DOM manipulation.

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
  )

  const jsonLdString = $derived(
    metadata
      ? `<script type="application/ld+json">${JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: metadata.title,
          description: metadata.description,
          image: metadata.image
            ? `${siteConfig.siteUrl}${metadata.image}`
            : `${siteConfig.siteUrl}/og-image.jpg`,
          datePublished: metadata.date,
          dateModified: metadata.updated || metadata.date,
          author: {
            '@type': 'Person',
            name: metadata.author || siteConfig.author.name,
            url: siteConfig.siteUrl
          },
          publisher: {
            '@type': 'Organization',
            name: siteConfig.title,
            logo: {
              '@type': 'ImageObject',
              url: `${siteConfig.siteUrl}/pwa-512x512.png`
            }
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${siteConfig.siteUrl}/blog/${metadata.slug}`
          },
          keywords: metadata.tags?.join(', ') || '',
          articleSection: metadata.categories?.[0] || 'Blog',
          wordCount: metadata.wordCount || 0,
          timeRequired: `PT${metadata.readingTime || 5}M`
        })}</' + 'script>'`
      : ''
  )
</script>

<SEO {...seoConfig} />

<!-- Structured Data for Article -->
<svelte:head>
  {#if metadata}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html jsonLdString}

    <!-- Canonical URL -->
    <link rel="canonical" href="{siteConfig.siteUrl}/blog/{metadata.slug}" />
  {/if}
</svelte:head>

<div class="px-4 sm:px-6">
  {#if metadata}
    <article class="py-10 animate-fade-in" itemscope itemtype="https://schema.org/BlogPosting">
      <header class="mb-10 space-y-6">
        <!-- Title -->
        <h1
          class="text-3xl text-gray-950 font-black leading-tight tracking-tight lg:text-5xl sm:text-4xl dark:text-white"
          itemprop="headline"
        >
          {metadata.title}
        </h1>

        <!-- Meta info -->
        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-950 font-bold dark:text-gray-50"
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
          <span class="text-gray-950 font-bold dark:text-gray-200">
            <span itemprop="timeRequired" content="PT{metadata.readingTime}M">
              {metadata.readingTime} phút đọc
            </span>
          </span>
          <span aria-hidden="true" class="text-gray-300 dark:text-gray-700">|</span>
          <span class="text-gray-950 font-bold dark:text-gray-200">
            {views} lượt đọc
          </span>
        </div>

        <div class="flex items-center pt-2">
          <LikeAndShare />
        </div>

        <!-- Hidden meta for SEO -->
        <meta itemprop="image" content={metadata.image || '/og-image.jpg'} />
        <meta itemprop="description" content={metadata.description} />
      </header>

      <!-- Post content — the compiled PostContent has a <slot name="toc">
           inserted at build time (see rehypeInsertTocSlot in
           mdsvex.config.js) right between the intro paragraph(s) and the
           first heading. Filling that slot here makes the ToC a real DOM
           child at the correct position — true source order matches
           visual order, no CSS reordering trick, no DOM manipulation. -->
      <section
        class="max-w-none prose prose-neutral prose-img:rounded-[2rem] prose-a:text-sky-900 prose-headings:text-gray-950 prose-li:text-gray-950 prose-ol:text-gray-950 prose-p:text-gray-950 prose-strong:text-gray-950 prose-ul:text-gray-950 prose-a:font-bold prose-headings:font-black prose-img:shadow-2xl dark:prose-invert dark:prose-a:text-sky-400 dark:prose-headings:text-white dark:prose-li:text-gray-50 dark:prose-ol:text-gray-50 dark:prose-p:text-gray-50 dark:prose-strong:text-white dark:prose-ul:text-gray-50"
        itemprop="articleBody"
      >
        <PostContent>
          {#snippet toc()}
            {#if hasToc}
              <nav class="not-prose my-10">
                <ToC post={{ metadata }} />
              </nav>
            {/if}
          {/snippet}
        </PostContent>
      </section>

      {#if faqs.length > 0}
        <div class="not-prose mt-20">
          <FAQ items={faqs} />
        </div>
      {/if}

      <footer class="mt-16 space-y-10">
        <!-- Tags -->
        <div class="border-t border-gray-100 pt-8 dark:border-gray-800">
          <PostTags post={{ metadata }} />
        </div>

        <PostNavigation post={{ metadata }} />
      </footer>
    </article>
  {/if}
</div>
