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

  // Mute schema console validation log noises immediately
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
   * Triggers native full-page redirection sequence towards Appwrite Cloud authentication layer.
   */
  function triggerAppwriteOAuth() {
    const client = new Client()
      .setEndpoint('https://appwrite.io')
      .setProject('698965f2000da6808b70');

    const account = new Account(client);
    
    // Fallback and redirect landing targets point strictly to this exact clean admin view path
    const currentUrl = window.location.origin + window.location.pathname;

    account.createOAuth2Session(
      'github',
      currentUrl, 
      currentUrl,
      ['repo', 'user'] // Permissions required for write access to GitHub storage pipelines
    );
  }

  onMount(async () => {
    if (!browser) return

    // Core Intercept: If redirected back with token metrics, stash into storage locations instantly
    if (oauthData?.token) {
      localStorage.setItem('sveltia-cms:local-provider-token', oauthData.token);
      localStorage.setItem('decap-cms:user', JSON.stringify({ token: oauthData.token, backendName: 'github' }));
      
      // Clean query parameters from URL address bar for clean aesthetic state layout
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (loadError) {
      cmsError = loadError
      return
    }

    try {
      const sveltia = await import('@sveltia/cms')
      const CMS = sveltia.default

      // Verify if a token is present either from the current load prop or from prior localStorage states
      const savedToken = localStorage.getItem('sveltia-cms:local-provider-token');
      
      if (cmsConfig) {
        cmsConfig.load_config_file = false;

        // Listen for internal Sveltia trigger event if token is not cached yet
        window.addEventListener('message', (event) => {
          if (event.data === 'request:auth') {
            triggerAppwriteOAuth();
          }
        });

        // Initialize utilizing configuration context properties
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
