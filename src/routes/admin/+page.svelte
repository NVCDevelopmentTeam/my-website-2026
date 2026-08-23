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
   * Directly constructs the native Appwrite Cloud OAuth REST URL.
   * This bypasses the async SDK side-effects that cause Sveltia CMS to freeze and loop.
   */
  function triggerAppwriteOAuth() {
    const projectId = '698965f2000da6808b70';
    const provider = 'github';
    
    // Construct the absolute callback URL pointing back directly to this admin page
    const redirectUrl = window.location.origin + window.location.pathname;

    // Build the exact explicit REST API URL that Appwrite Web SDK generates under the hood
    const appwriteOAuthUrl = `https://appwrite.io{provider}?project=${projectId}&success=${encodeURIComponent(redirectUrl)}&failure=${encodeURIComponent(redirectUrl)}&scopes[]=repo&scopes[]=user`;

    // Open a completely decoupled native browser popup window
    // This fully detaches the redirection lifecycle from Sveltia's internal state machine
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

    // Context Execution Block: Inside the spawned POPUP view window post-authorization
    if (oauthData?.token) {
      const payload = { token: oauthData.token, provider: oauthData.provider };
      
      // Transmit credentials backward into the main dashboard controller frame securely
      if (window.opener) {
        window.opener.postMessage(
          `authorizing:${oauthData.provider}:success:${JSON.stringify(payload)}`,
          window.location.origin
        );
        // Safely close the auxiliary auth popup window
        window.close();
        return;
      } else {
        // Fallback: If opened in standard view instead of a popup, stash into storage directly
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

      // Check if a valid token is already stashed inside storage keys
      const savedToken = localStorage.getItem('sveltia-cms:local-provider-token');

      if (cmsConfig) {
        cmsConfig.load_config_file = false;

        // Clean slate event listener to trap Sveltia CMS login button clicks
        window.addEventListener('message', (event) => {
          if (event.data === 'request:auth') {
            triggerAppwriteOAuth();
          }
        });

        // Initialize Sveltia CMS dashboard interface layout
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
