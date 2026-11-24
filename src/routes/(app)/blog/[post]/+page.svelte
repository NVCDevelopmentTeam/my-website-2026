<script>
  import { siteConfig } from '#lib/config.js'
  import PostDate from '#lib/components/PostDate.svelte'
  import PostAuthor from '#lib/components/PostAuthor.svelte'
  import PostCategories from '#lib/components/PostCategories.svelte'
  import PostTags from '#lib/components/PostTags.svelte'
  import LikeAndShare from '#lib/components/LikeAndShare.svelte'
  import FAQ from '#lib/components/FAQ.svelte'
  import PostNavigation from '#lib/components/PostNavigation.svelte'
  import SEO from '#lib/components/SEO.svelte'
  import { getSeoConfig, serializeSchema } from '#lib/utils/seo.js'
  import {
    fetchEngagement,
    hasEngaged,
    sendEngagement,
    setEngaged,
    withOwnActions
  } from '#lib/utils/engagement.js'

  const { data } = $props()
  const { content: PostContent, metadata } = $derived.by(() => data)
  const faqs = $derived(/** @type {Record<string, any>} */ (metadata)?.faqs || [])
  // Likes and reads of this post, from the site's own counter. null = not available (yet).
  /** @type {{ likes: number | null, views: number | null }} */
  let stats = $state({ likes: null, views: null })

  $effect(() => {
    const slug = metadata?.slug
    if (!slug) return

    let current = true
    stats = { likes: null, views: null }
    ;(async () => {
      const counts = await fetchEngagement(slug)
      if (!current || !counts) return
      stats = withOwnActions(counts, slug)

      // Only the first visit of a visitor is a read; re-reading never adds to it
      if (hasEngaged('view', slug)) return
      const result = await sendEngagement(slug, 'view')
      if (!result) return
      setEngaged('view', slug)
      if (current && result.changed) stats.views = result.count
    })()
    return () => {
      current = false
    }
  })

  const seoConfig = $derived(
    getSeoConfig({
      title: metadata?.title,
      description: metadata?.description,
      url: `/blog/${metadata?.slug}`,
      image: metadata?.image ?? undefined,
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
        })
      : ''
  )
</script>

<SEO {...seoConfig} />

<!-- Structured Data for Article -->
<svelte:head>
  {#if metadata}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html jsonLdString}
  {/if}
</svelte:head>

<div class="px-[var(--gutter)]">
  {#if metadata}
    <article class="py-10" itemscope itemtype="https://schema.org/BlogPosting">
      <header class="mb-10 space-y-6">
        <!-- Title -->
        <h1
          class="text-gray-950 font-black leading-tight tracking-tight dark:text-white"
          itemprop="headline"
        >
          {metadata.title}
        </h1>

        <!-- Meta info -->
        <div
          class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-950 font-bold dark:text-gray-50"
        >
          <div itemprop="author" itemscope itemtype="https://schema.org/Person">
            <meta itemprop="name" content={metadata.author || siteConfig.author.name} />
            <PostAuthor post={{ metadata }} />
          </div>
          <div itemprop="datePublished">
            <PostDate post={{ metadata }} />
          </div>
          {#if metadata.updated}
            <meta itemprop="dateModified" content={metadata.updated} />
          {/if}
          <p class="m-0 text-gray-950 font-bold dark:text-gray-200">
            <meta itemprop="timeRequired" content="PT{metadata.readingTime}M" />
            {metadata.readingTime} phút đọc
          </p>

          {#if stats.views !== null}
            <p class="m-0 text-gray-950 font-bold dark:text-gray-200">{stats.views} lượt đọc</p>
          {/if}
        </div>

        <PostCategories post={{ metadata }} />

        <div class="flex items-center pt-2">
          <LikeAndShare slug={metadata.slug} bind:likes={stats.likes} />
        </div>
        <!-- Hidden meta for SEO -->
        <meta itemprop="image" content={metadata.image || '/og-image.jpg'} />
        <meta itemprop="description" content={metadata.description} />
      </header>

      <!-- Post content. The ToC is part of the compiled document: mdsvex wraps everything from the
           first heading on in a `toc_slot` directive (mdsvex.config.js, TocSlot.svelte), so it sits
           between the intro and that heading in true source order — no CSS reordering, no DOM
           manipulation. -->
      <section
        class="max-w-none prose prose-neutral prose-img:rounded-[2rem] prose-a:text-sky-900 prose-headings:text-gray-950 prose-li:text-gray-950 prose-ol:text-gray-950 prose-p:text-gray-950 prose-strong:text-gray-950 prose-ul:text-gray-950 prose-a:font-bold prose-headings:font-black prose-img:shadow-2xl dark:prose-invert dark:prose-a:text-sky-400 dark:prose-headings:text-white dark:prose-li:text-gray-50 dark:prose-ol:text-gray-50 dark:prose-p:text-gray-50 dark:prose-strong:text-white dark:prose-ul:text-gray-50"
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
        <!-- Tags -->
        <div class="border-t border-gray-100 pt-8 dark:border-gray-800">
          <PostTags post={{ metadata }} />
        </div>

        <PostNavigation post={{ metadata }} />
      </footer>
    </article>
  {/if}
</div>
