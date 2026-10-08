<script>
  import SvelteSeo from 'svelte-seo'
  import { siteConfig } from '#lib/config.js'

  let { title, description, canonical, openGraph = {}, twitter = {} } = $props()

  const og = $derived({
    type: openGraph.type || 'website',
    url: openGraph.url || canonical,
    title: openGraph.title || title,
    description: openGraph.description || description,
    site_name: openGraph.site_name,
    images: openGraph.images || [{ url: `${siteConfig.siteUrl}/og-image.jpg` }],
    ...openGraph
  })

  const tw = $derived({
    card: twitter.card || 'summary_large_image',
    title: twitter.title || title,
    description: twitter.description || description,
    // Cards of type summary_large_image need an image: fall back to the Open Graph one
    image: twitter.image || og.images?.[0]?.url,
    site: twitter.site,
    ...twitter
  })

  // svelte-seo renders a tag for every key it receives, even when the value is undefined
  // (that produced empty `<meta name="twitter:site"/>` tags), so pass only values that exist.
  const twitterTags = $derived(
    Object.fromEntries(
      Object.entries({
        card: tw.card,
        site: tw.site,
        title: tw.title,
        description: tw.description,
        image: tw.image
      }).filter(([, value]) => value)
    )
  )

  // Keywords derived from tags if available
  const keywords = $derived(
    twitter.keywords || openGraph.keywords || (openGraph.tags ? openGraph.tags.join(', ') : '')
  )
</script>

<SvelteSeo
  {title}
  {description}
  {canonical}
  {keywords}
  openGraph={{
    title: og.title,
    description: og.description,
    url: og.url,
    type: og.type,
    site_name: og.site_name,
    images: og.images
  }}
  twitter={twitterTags}
/>

<svelte:head>
  <!-- svelte-seo has no `robots` / `additionalMetaTags` props, so the extra tags live here.
       Directives of several robots tags are combined by search engines (index,follow above). -->
  <meta name="robots" content="max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  {#if siteConfig.geo}
    <meta name="geo.region" content={siteConfig.geo.region} />
    <meta name="geo.placename" content={siteConfig.geo.placename} />
    <meta name="geo.position" content={siteConfig.geo.position} />
    <meta name="ICBM" content={siteConfig.geo.icbm} />
  {/if}
</svelte:head>
