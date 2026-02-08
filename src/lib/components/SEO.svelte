<script>
  import SvelteSeo from 'svelte-seo';
  import { siteConfig } from '$lib/config';

  let {
    title,
    description,
    canonical,
    openGraph = {},
    twitter = {}
  } = $props();

  const og = $derived({
    type: openGraph.type || 'website',
    url: openGraph.url || canonical,
    title: openGraph.title || title,
    description: openGraph.description || description,
    site_name: openGraph.site_name,
    images: openGraph.images || [{ url: `${siteConfig.siteUrl}/og-image.jpg` }],
    ...openGraph
  });

  const tw = $derived({
    card: twitter.card || 'summary_large_image',
    title: twitter.title || title,
    description: twitter.description || description,
    image: twitter.image,
    ...twitter
  });

  // Keywords derived from tags if available
  const keywords = $derived(
    twitter.keywords || openGraph.keywords || (openGraph.tags ? openGraph.tags.join(', ') : '')
  );
</script>

<SvelteSeo
  {title}
  {description}
  {canonical}
  keywords={keywords}
  openGraph={{
    title: og.title,
    description: og.description,
    url: og.url,
    type: og.type,
    site_name: og.site_name,
    images: og.images
  }}
  twitter={{
    card: tw.card,
    site: tw.site,
    title: tw.title,
    description: tw.description,
    image: tw.image
  }}
  robots="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  additionalMetaTags={[
    { name: 'googlebot', content: 'index, follow' },
    // Geo Tags
    ...(siteConfig.geo ? [
      { name: 'geo.region', content: siteConfig.geo.region },
      { name: 'geo.placename', content: siteConfig.geo.placename },
      { name: 'geo.position', content: siteConfig.geo.position },
      { name: 'ICBM', content: siteConfig.geo.icbm }
    ] : [])
  ]}
/>
