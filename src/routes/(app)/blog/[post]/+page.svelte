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
  import { getSeoConfig, serializeSchema } from '$lib/utils/seo'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'

  const { data } = $props()
  const { content: PostContent, metadata } = $derived.by(function () {
    return data
  })

  const faqs = $derived(metadata?.faqs || [])
  const hasToc = $derived(metadata?.toc && metadata.toc.length > 0)

  /** @type {number} — starts at 0, updated client-side after mount */
  let views = $state(0)

  // Track page views per post using localStorage.
  // Deferred via setTimeout to run after paint — keeps it off the critical path.
  onMount(function () {
    if (!browser || !metadata) return

    // Non-critical: defer 200ms to avoid blocking TBT
    setTimeout(function () {
      var viewKey = 'views_' + (metadata.slug || 'unknown')
      var sessionKey = 'viewed_' + (metadata.slug || 'unknown')

      var currentViews = parseInt(localStorage.getItem(viewKey) || '0', 10)

      // Only increment if not already viewed in this session
      var alreadyViewed = sessionStorage.getItem(sessionKey)
      if (!alreadyViewed) {
        currentViews += 1
        sessionStorage.setItem(sessionKey, 'true')
        localStorage.setItem(viewKey, currentViews.toString())
      }

      views = currentViews
    }, 200)
  })

  const seoConfig = $derived(
    getSeoConfig({
      title: metadata?.title,
      description: metadata?.description,
      url: '/blog/' + metadata?.slug,
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
      ? serializeSchema({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: metadata.title,
          description: metadata.description,
          image: metadata.image
            ? siteConfig.siteUrl + metadata.image
            : siteConfig.siteUrl + '/og-image.jpg',
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
              url: siteConfig.siteUrl + '/logo.png'
            }
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': siteConfig.siteUrl + '/blog/' + metadata.slug
          },
          keywords: metadata.tags?.join(', ') || '',
          articleSection: metadata.categories?.[0] || 'Blog',
          wordCount: metadata.wordCount || 0,
          timeRequired: 'PT' + (metadata.readingTime || 5) + 'M'
        })
      : ''
  )
</script>

<SEO {...seoConfig} />

<!-- Structured data for article -->
<svelte:head>
  {#if metadata}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html jsonLdString}
    <link rel="canonical" href="{siteConfig.siteUrl}/blog/{metadata.slug}" />
  {/if}
</svelte:head>

<div class="px-4 sm:px-6">
  {#if metadata}
    <article class="animate-fade-in py-10" itemscope itemtype="https://schema.org/BlogPosting">
      <header class="mb-10 space-y-6">
        <h1
          class="text-3xl leading-tight font-black tracking-tight text-gray-950 sm:text-4xl lg:text-5xl dark:text-white"
          itemprop="headline"
        >
          {metadata.title}
        </h1>

        <!-- Meta info -->
        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-gray-950 dark:text-gray-50"
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
              {metadata.readingTime} min read
            </span>
          </span>
          {#if views > 0}
            <span aria-hidden="true" class="text-gray-300 dark:text-gray-700">|</span>
            <span class="font-bold text-gray-950 dark:text-gray-200">
              {views} views
            </span>
          {/if}
        </div>

        <div class="flex items-center pt-2">
          <LikeAndShare />
        </div>

        <!-- Hidden meta for SEO -->
        <meta itemprop="image" content={metadata.image || '/og-image.jpg'} />
        <meta itemprop="description" content={metadata.description} />
      </header>

      <!-- Table of Contents — rendered inline before body (no DOM manipulation = no forced reflow) -->
      {#if hasToc}
        <div class="not-prose my-10">
          <ToC post={{ metadata }} />
        </div>
      {/if}

      <!-- Post content -->
      <section
        class="prose max-w-none prose-neutral dark:prose-invert
  [&_h1]:font-black [&_h2]:font-black [&_h3]:font-black [&_h4]:font-black
  [&_h1]:text-gray-950 [&_h2]:text-gray-950 [&_h3]:text-gray-950 [&_h4]:text-gray-950
  dark:[&_h1]:text-white dark:[&_h2]:text-white dark:[&_h3]:text-white dark:[&_h4]:text-white
  [&_p]:text-gray-950 dark:[&_p]:text-gray-50
  [&_a]:font-bold [&_a]:text-sky-900 dark:[&_a]:text-sky-400
  [&_strong]:text-gray-950 dark:[&_strong]:text-white
  [&_ol]:text-gray-950 dark:[&_ol]:text-gray-50
  [&_ul]:text-gray-950 dark:[&_ul]:text-gray-50
  [&_li]:text-gray-950 dark:[&_li]:text-gray-50
  [&_img]:rounded-[2rem] [&_img]:shadow-2xl"
        itemprop="articleBody"
      >
        <PostContent />
      </section>

      {#if faqs.length > 0}
        <div class="not-prose mt-20">
          <FAQ items={faqs} />
        </div>
      {/if}

      <footer class="mt-16 space-y-10">
        <div class="border-t border-gray-100 pt-8 dark:border-gray-800">
          <PostTags post={{ metadata }} />
        </div>

        <PostNavigation post={{ metadata }} />
      </footer>
    </article>
  {/if}
</div>
