<script>
  import { siteConfig } from '$lib/config';
  import Header from '$lib/components/Header.svelte';
import Sidebar from '$lib/components/sidebar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { page } from '$app/state';

  let { children, data } = $props();

  const canonicalUrl = $derived(`${siteConfig.siteUrl}${page.url.pathname === '/' ? '' : page.url.pathname}`);

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
    name: siteConfig.title,
    url: siteConfig.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.siteUrl}/blog?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author.name,
    url: `${siteConfig.siteUrl}/about`,
    sameAs: Object.values(siteConfig.social).filter(v => v && v !== '/'),
    jobTitle: 'Người sáng tạo nội dung'
  };
</script>

<svelte:head>
  <title>{siteConfig.title}</title>
  <meta name="description" content={siteConfig.description} />
  <link rel="canonical" href={canonicalUrl} />
  
  <!-- Structured Data -->
  {@html '<script type="application/ld+json">' + JSON.stringify(orgJsonLd) + '</script>'}
  {@html '<script type="application/ld+json">' + JSON.stringify(webSiteJsonLd) + '</script>'}
  {@html '<script type="application/ld+json">' + JSON.stringify(personJsonLd) + '</script>'}
</svelte:head>

<div class="flex flex-col min-h-screen">
  <Header     allPages={data.allPages}     navPages={data.navPages}   />

<Breadcrumbs 
  allPages={data.allPages}  
  posts={data.posts} />

<main id="main-content" tabindex="-1" class="flex-grow max-w-7xl mx-auto bg-custom-background bg-cover bg-center w-full">
  <!-- Google AdSense ad units can be placed here for integration -->
  {@render children?.()}
<Sidebar />
</main>

<Footer recentPosts={data.recentPosts} pages={data.allPages} />
</div>