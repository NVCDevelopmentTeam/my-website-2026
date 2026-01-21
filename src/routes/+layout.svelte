<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte';
  import { siteConfig } from '$lib/config.js';
  import '../app.css';

  let isDarkMode = false;
  let menuOpen = false;

  onMount(() => {
    // Check for saved theme preference or system preference
    if (localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      isDarkMode = true;
    } else {
      document.documentElement.classList.remove('dark');
      isDarkMode = false;
    }
  });

  function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
  }
</script>

<svelte:head>
  <title>{siteConfig.title}</title>
  <meta name="description" content={siteConfig.description} />
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  
  <meta name="google-adsense-account" content="ca-pub-3602487920405886" />
  <script defer src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3602487920405886" crossorigin="anonymous"></script>
  
  <link href="/sveltiaconfig.json" type="application/json" rel="cms-config-url" />
  <link rel="sitemap" type="application/xml" href="{siteConfig.siteUrl}/sitemap.xml" />
  <link rel="alternate" type="application/rss+xml" href="{siteConfig.siteUrl}/rss.xml" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col font-sans">
  <!-- Header -->
  <header class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex-shrink-0">
          <a href="/" class="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{siteConfig.title}</a>
        </div>
        <nav class="hidden md:flex items-center space-x-8">
          <a href="/" class="font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">Trang chủ</a>
          <a href="/blog" class="font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">Blog</a>
          <a href="/about" class="font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">Giới thiệu</a>
        </nav>
        <div class="flex items-center">
          <button on:click={toggleTheme} class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Toggle dark mode">
            {#if isDarkMode}
              <!-- Sun Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            {:else}
              <!-- Moon Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            {/if}
          </button>
          <div class="md:hidden ml-2">
            <button on:click={toggleMenu} class="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Open menu">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Mobile Menu -->
    {#if menuOpen}
      <div class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a href="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Trang chủ</a>
          <a href="/blog" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Blog</a>
          <a href="/about" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Giới thiệu</a>
        </div>
      </div>
    {/if}
  </header>

  <!-- Main Content -->
  <main class="flex-grow max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full" id="main-content">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>&copy; {new Date().getFullYear()} {siteConfig.author.name}. All rights reserved.</p>
      <div class="flex justify-center space-x-4 mt-2">
        {#if siteConfig.social.github}
          <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" class="hover:text-primary-500 dark:hover:text-primary-400">GitHub</a>
        {/if}
        {#if siteConfig.social.facebook}
          <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" class="hover:text-primary-500 dark:hover:text-primary-400">Facebook</a>
        {/if}
        {#if siteConfig.social.zalo}
          <a href={siteConfig.social.zalo} target="_blank" rel="noopener noreferrer" class="hover:text-primary-500 dark:hover:text-primary-400">Zalo</a>
        {/if}
      </div>
    </div>
  </footer>
</div>
