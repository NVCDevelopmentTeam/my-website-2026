<script>
  import { siteConfig } from '$lib/config'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'

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
   * Dynamically constructs the Appwrite Cloud OAuth REST URL pattern based on active environment metrics.
   * Bypasses hardcoded domain values to ensure smooth transitions between localhost, staging, and production domains.
   */
  function triggerAppwriteOAuth() {
    const projectId = '698965f2000da6808b70'; // Keep your explicit Appwrite project ID fixed
    const provider = 'github';
    
    // 1. Dynamic Website Domain: Auto-resolves current site URL context (localhost, production-domain.com, etc.)
    const currentSiteOrigin = window.location.origin;
    const redirectUrl = currentSiteOrigin + window.location.pathname;

    // 2. Dynamic Appwrite API Domain: Pulls directly from siteConfig parameters or fallbacks to the current origin
    const appwriteApiBase = siteConfig?.siteUrl || 'https://appwrite.network';
    
    // Ensure the endpoint path securely appends the core v1 API suffix structure
    const appwriteEndpoint = `${appwriteApiBase.replace(/\/$/, '')}/v1`;

    // Compile the explicit REST URL using real-time evaluated parameters to prevent redirect freezing loops
    const appwriteOAuthUrl = `${appwriteEndpoint}/account/sessions/oauth2/${provider}` +
      `?project=${projectId}` +
      `&success=${encodeURIComponent(redirectUrl)}` +
      `&failure=${encodeURIComponent(redirectUrl)}` +
      `&scopes[]=repo&scopes[]=user`;

    // Launch an isolated browser popup layout container safely detached from main thread lifecycles
    const width = 600;
    const height = 750;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      appwriteOAuthUrl,
      'Appwrite-OAuth-Gateway',
      `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
    );
  }

  onMount(async () => {
    if (!browser) return

    // Context Execution Block: Triggered inside the temporary auth popup container window view
    if (oauthData?.token) {
      const payload = { token: oauthData.token, provider: oauthData.provider };
      
      // Securely transfer credentials backward into the master main parent panel layout context
      if (window.opener) {
        window.opener.postMessage(
          `authorizing:${oauthData.provider}:success:${JSON.stringify(payload)}`,
          window.location.origin
        );
        // Automatically self-destruct and close the isolated popup container tab
        window.close();
        return;
      } else {
        // Fallback: If parameters arrive outside an opener context, stash metrics inside storage keys natively
        localStorage.setItem('sveltia-cms:local-provider-token', oauthData.token);
        localStorage.setItem('decap-cms:user', JSON.stringify({ token: oauthData.token, backendName: 'github' }));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
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

        // Establish message event listening pipeline to catch Sveltia's login triggers
        window.addEventListener('message', (event) => {
          if (event.data === 'request:auth') {
            triggerAppwriteOAuth();
          }
        });

        // Initialize Sveltia CMS GUI container layout links
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
