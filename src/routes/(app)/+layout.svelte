<script>
  import { siteConfig } from '$lib/config';
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { page } from '$app/state';

  let { children, data } = $props();

  // Compute canonicalUrl defensively (avoid $derived misuse)
  const canonicalUrl = siteConfig.siteUrl + (page?.url?.pathname === '/' ? '' : (page?.url?.pathname ?? ''));

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.siteUrl}/favicon.ico`,
      width: '32',
      height: '32'
    },
    sameAs: Object.values(siteConfig.social).filter(v => v && v !== '/')
  };

  const webSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteConfig.siteUrl,
    name: siteConfig.title
  };
</script>

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
  {@html '<script type="application/ld+json">' + JSON.stringify(orgJsonLd) + '</script>'}
  {@html '<script type="application/ld+json">' + JSON.stringify(webSiteJsonLd) + '</script>'}
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />
  <div class="flex-1 flex gap-8">
    <main class="flex-1">
      {@render children?.()}
    </main>
    <aside class="w-72 hidden lg:block">
      <Sidebar />
    </aside>
  </div>
  <Footer />
</div>