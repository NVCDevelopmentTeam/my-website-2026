<!-- src/routes/blog/[slug]/+page.svelte -->
<script>
  import { formatDate } from '$lib/utils.js';

  /** @type {import('./$types').PageData} */
  export let data;
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:title" content={data.title}>
  <meta property="og:description" content={data.description}>

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:title" content={data.title}>
  <meta property="twitter:description" content={data.description}>
</svelte:head>

<article class="prose dark:prose-invert max-w-none">
  <header class="mb-8">
    <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
      {data.title}
    </h1>
    <div class="mt-4 text-gray-500 dark:text-gray-400">
      <span>Published on <time datetime={data.date}>{formatDate(data.date)}</time></span>
      {#if data.readingTime}
        <span class="mx-2">&middot;</span>
        <span>{data.readingTime} min read</span>
      {/if}
    </div>
  </header>

  <svelte:component this={data.content} />

</article>

<div class="mt-12">
  <a href="/blog" class="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
    &larr; Back to all posts
  </a>
</div>
