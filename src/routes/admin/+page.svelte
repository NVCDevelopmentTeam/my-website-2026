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
   * Directly triggers the asynchronous full-page redirection towards Appwrite Cloud OAuth gateway.
   * This is executed inline inside the window context to seamlessly hand over control to GitHub.
   */
  function executeDirectAppwriteOAuth() {
    const client = new Client()
      .setEndpoint('https://appwrite.io') // Target the centralized secure API gateway
      .setProject('698965f2000da6808b70');

    const account = new Account(client);
    
    // Fallback and redirect landing targets point strictly back to this clean admin view path
    const currentSiteUrl = window.location.origin + window.location.pathname;

    account.createOAuth2Session(
      'github',
      currentSiteUrl, 
      currentSiteUrl,
      ['repo', 'user'] // Scope parameters allowing write access to GitHub storage
    );
  }

  onMount(async () => {
    if (!browser) return

    // 1. POPUP WINDOW LIFECYCLE INTERCEPT: Post-Authorization Token Return
    // If this window is the spawned tab and now contains valid credentials from Appwrite redirect
    if (oauthData?.token) {
      if (window.opener) {
        const payload = { token: oauthData.token, provider: oauthData.provider };
        // Post the Git credentials back to the main master dashboard controller frame securely
        window.opener.postMessage(
          `authorizing:${oauthData.provider}:success:${JSON.stringify(payload)}`,
          window.location.origin
        );
        // Self-destruct and close this secondary auth tab cleanly
        window.close();
        return;
      }
    }

    // 2. POPUP WINDOW LIFECYCLE INTERCEPT: Initial Click Launch
    // Sveltia CMS creates a new tab targeting current admin URL but signs it with an internal opener context.
    // If this current window has a master opener, it means it is Sveltia's designated authentication tab!
    if (window.opener && !oauthData?.token) {
      // Immediately kick off the Appwrite login protocol to route this tab directly to GitHub
      executeDirectAppwriteOAuth();
      return;
    }

    if (loadError) {
      cmsError = loadError
      return
    }

    // 3. MAIN DASHBOARD LIFECYCLE: Initialization and Event Binding
    if (!window.opener && cmsConfig) {
      try {
        const sveltia = await import('@sveltia/cms')
        const CMS = sveltia.default

        cmsConfig.load_config_file = false;

        // Satisfy Sveltia's trigger routine. When clicking login, Sveltia spawns the tab.
        // We catch that window signal here and notify the child view to prepare execution.
        window.addEventListener('message', (event) => {
          if (event.data === 'request:auth') {
            // Sveltia automatically opens the tab; our window.opener checks above handle the rest!
            console.log('Sveltia login hook intercepted successfully.');
          }
        });

        // Initialize Sveltia CMS GUI dashboard layout links
        await CMS.init({
          config: cmsConfig
        })

        cmsInitialized = true
      } catch (err) {
        cmsError = err.message || err
        console.error('CMS Runtime Mount Exception:', err)
      }
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
  {:else if !cmsInitialized && !oauthData}
    <div role="status" aria-busy="true" class="text-center text-lg font-bold text-gray-950 dark:text-gray-50">
      <p>Đang tải Hệ thống quản lý nội dung…</p>
    </div>
  {:else if oauthData}
    <div role="status" class="text-center text-lg font-bold text-emerald-600">
      <p>Xác thực thành công! Đang đồng bộ hóa quyền hạn...</p>
    </div>
  {:else}
    <div id="sveltia-cms"></div>
  {/if}
</main>
