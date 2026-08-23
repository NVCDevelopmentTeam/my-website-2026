<script>
  import { siteConfig } from '$lib/config'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { Client, Account } from 'appwrite'

  let props = $props()
  const cmsConfig = $derived(props?.data?.config)
  const loadError = $derived(props?.data?.error || props?.data?.oauthError)
  const oauthData = $derived(props?.data?.oauthSuccess ? props.data : null)

  let cmsInitialized = $state(false)
  let cmsError = $state(null)

  // Mute schema console validation log notices immediately
  if (browser) {
    const originalConsoleInfo = console.info;
    console.info = function (...args) {
      if (args && typeof args === 'string' && args.includes('validate your configuration file')) {
        return; 
      }
      originalConsoleInfo.apply(console, args);
    };
  }

  /**
   * Triggers native top-level window redirection towards Appwrite Cloud OAuth gateway.
   * This entirely bypasses browser pop-up blockers by navigating inline within the same tab view.
   */
  function triggerAppwriteOAuthDirect() {
    const client = new Client()
      .setEndpoint('https://appwrite.io') // Point to official secure server gateway
      .setProject('698965f2000da6808b70');

    const account = new Account(client);
    
    // Auto-resolve current site address dynamically to maintain compatibility if you change domains later
    const currentSiteUrl = window.location.origin + window.location.pathname;

    // Execute standard SDK navigation. This redirects the current tab directly to GitHub login
    account.createOAuth2Session(
      'github',
      currentSiteUrl, // Redirect back here on successful auth
      currentSiteUrl, // Fallback here if auth fails or cancels
      ['repo', 'user'] // Critical permission scope flags to grant write access to Git
    );
  }

  onMount(async () => {
    if (!browser) return

    // Core Intercept: If redirected back from Appwrite with validated credentials, inject them instantly
    if (oauthData?.token) {
      localStorage.setItem('sveltia-cms:local-provider-token', oauthData.token);
      localStorage.setItem('decap-cms:user', JSON.stringify({ token: oauthData.token, backendName: 'github' }));
      
      // Clear url address parameters to restore a clean administrative path layout look
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (loadError) {
      cmsError = loadError
      return
    }

    try {
      const sveltia = await import('@sveltia/cms')
      const CMS = sveltia.default

      if (cmsConfig) {
        cmsConfig.load_config_file = false;

        // Establish message event listening pipeline to trap Sveltia's login triggers
        window.addEventListener('message', (event) => {
          if (event.data === 'request:auth') {
            triggerAppwriteOAuthDirect();
          }
        });

        // Initialize Sveltia CMS GUI dashboard container
        await CMS.init({
          config: cmsConfig
        })

        cmsInitialized = true
      }
    } catch (err) {
      cmsError = err.message || err
      console.error('CMS Runtime Mount Exception:', err)
    }
  })
</script>

<svelte:head>
  <title>Bản điều khiển | {siteConfig.title}</title>
  <meta name="description" content={siteConfig.description} />
</svelte:head>

<main class="mt-10 px-4" aria-live="polite">
  {#if cmsError}
    <div role="alert" class="text-center text-red-800 dark:text-red-400">
      <h2 class="text-2xl font-black">Khởi tạo CMS thất bại</h2>
      <p class="mt-2 font-bold">{cmsError}</p>
    </div>
  {:else if !cmsInitialized}
    <div role="status" aria-busy="true" class="text-center text-lg font-bold text-gray-950 dark:text-gray-50">
      <p>Đang tải Hệ thống quản lý nội dung…</p>
    </div>
  {:else}
    <div id="sveltia-cms"></div>
  {/if}
</main>
