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
   * Compiles the explicit Appwrite Cloud REST API OAuth link structure.
   * Isolates the window lifecycle from Sveltia CMS to completely bypass AbortError loops.
   */
  function triggerAppwriteOAuth() {
    const projectId = '698965f2000da6808b70';
    const provider = 'github';
    
    // Auto-resolve current site address to keep redirect boundaries dynamic (localhost vs custom domain)
    const currentSiteOrigin = window.location.origin;
    const redirectUrl = currentSiteOrigin + window.location.pathname;

    // MANDATORY FIX: Appwrite Cloud OAuth endpoints must target the centralized cluster router gateway
    const appwriteEndpoint = 'https://appwrite.io';

    // Build the official strict REST URL query mapping scheme to avoid generic admin dashboard panel drops
    const appwriteOAuthUrl = `${appwriteEndpoint}/account/sessions/oauth2/${provider}` +
      `?project=${projectId}` +
      `&success=${encodeURIComponent(redirectUrl)}` +
      `&failure=${encodeURIComponent(redirectUrl)}` +
      `&scopes[]=repo&scopes[]=user`;

    // Initialize an isolated browser popup window context to retain window.opener memory references
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

    // Context Execution Block: Evaluated inside the spawned temporary popup auth window frame
    if (oauthData?.token) {
      const payload = { token: oauthData.token, provider: oauthData.provider };
      
      // Securely transfer credentials backward into the master parent layout view frame instantly
      if (window.opener) {
        window.opener.postMessage(
          `authorizing:${oauthData.provider}:success:${JSON.stringify(payload)}`,
          window.location.origin
        );
        // Automatically self-destruct and close the isolated popup container tab view
        window.close();
        return;
      } else {
        // Fallback: If parameters arrive outside an opener tab context, stash metrics inside storage keys natively
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
