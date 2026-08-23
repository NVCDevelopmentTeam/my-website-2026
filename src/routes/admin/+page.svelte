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

  // Mute schema console log notices immediately
  if (browser) {
    const originalConsoleInfo = console.info;
    console.info = function (...args) {
      if (args && typeof args === 'string' && args.includes('validate your configuration file')) {
        return; 
      }
      originalConsoleInfo.apply(console, args);
    };
  }

  // Custom handler to trigger Appwrite OAuth sequence when the editor clicks Login
  async function triggerAppwriteOAuth() {
    const client = new Client()
      .setEndpoint('https://appwrite.io')
      .setProject('698965f2000da6808b70'); // Insert your secure Appwrite project ID here

    const account = new Account(client);
    
    // Fire OAuth login redirection with mandatory repo write scopes
    account.createOAuth2Session(
      'github',
      window.location.href, // Redirect back to this exact admin page
      window.location.href,
      ['repo', 'user']       // Request write permissions for GitHub storage repository
    );
  }

  onMount(async () => {
    if (!browser) return

    // If this window is a login popup, transmit the Git token back to Sveltia CMS core
    if (oauthData) {
      const payload = { token: oauthData.token, provider: oauthData.provider };
      window.opener.postMessage(
        `authorizing:${oauthData.provider}:success:${JSON.stringify(payload)}`,
        window.location.origin
      );
      window.close();
      return;
    }

    if (loadError) {
      cmsError = loadError
      return
    }

    if (!cmsConfig) return

    try {
      const sveltia = await import('@sveltia/cms')
      const CMS = sveltia.default

      cmsConfig.load_config_file = false;

      // Intercept the default authentication action to plug in Appwrite instead of Netlify/Decap defaults
      // This ensures clicking "Login with GitHub" runs our inline function
      window.addEventListener('message', (event) => {
        if (event.data === 'request:auth') {
          triggerAppwriteOAuth();
        }
      });

      await CMS.init({
        config: cmsConfig
      })

      cmsInitialized = true
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
