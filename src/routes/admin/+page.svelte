<script>
  import { siteConfig } from '$lib/config'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { Client, Account, OAuthProvider } from 'appwrite'

  let props = $props()
  const cmsConfig = $derived(props?.data?.config)
  const loadError = $derived(props?.data?.error || props?.data?.oauthError)
  const oauthData = $derived(props?.data?.oauthSuccess ? props.data : null)

  let cmsInitialized = $state(false)
  let cmsError = $state(null)

  // Mute Sveltia's "validate your configuration file" console.info notice.
  // console.info(...args) always receives an array via rest params, so the
  // previous `typeof args === 'string'` check could never be true — check
  // the first argument instead.
  if (browser) {
    const originalConsoleInfo = console.info
    console.info = function (...args) {
      if (typeof args[0] === 'string' && args[0].includes('validate your configuration file')) {
        return
      }
      originalConsoleInfo.apply(console, args)
    }
  }

  /**
   * Kicks off Appwrite's OAuth2 *token* flow for GitHub.
   *
   * We deliberately use createOAuth2Token (not createOAuth2Session):
   * createOAuth2Session relies on Appwrite Cloud setting a session cookie
   * on cloud.appwrite.io, which modern browsers increasingly block as a
   * third-party cookie since it's a different domain than this site. The
   * token flow instead redirects back here with `?userId=&secret=` and we
   * create the session locally in +page.js, avoiding that failure mode.
   *
   * This performs a direct navigation on the CURRENT window — it must only
   * be called from inside the popup that Sveltia CMS itself opened, never
   * from the main CMS tab (that would navigate the whole app away).
   */
  async function triggerAppwriteOAuth() {
    const client = new Client()
      .setEndpoint(siteConfig.appwrite.endpoint)
      .setProject(siteConfig.appwrite.projectId)

    const account = new Account(client)

    // Round-trip back to this exact page (origin + pathname), matching the
    // backend.base_url / backend.auth_endpoint pair sent in the CMS config.
    const redirectUrl = window.location.origin + window.location.pathname

    await account.createOAuth2Token({
      provider: OAuthProvider.Github,
      success: redirectUrl,
      failure: redirectUrl,
      scopes: ['repo', 'user']
    })
    // createOAuth2Token performs the browser redirect itself; execution
    // effectively stops here.
  }

  onMount(async () => {
    if (!browser) return

    // Case 1: Appwrite just redirected back with a resolved GitHub token
    // (handled by +page.js). Relay it to Sveltia CMS and close the popup.
    if (oauthData?.token) {
      const payload = { token: oauthData.token, provider: oauthData.provider }

      if (window.opener) {
        // Sveltia (like Decap/Netlify CMS before it) listens for exactly
        // this "authorization:<provider>:success:<json>" string on the
        // opener window. The previous "authorizing:" prefix never matched
        // that listener, so the CMS would hang waiting for login forever.
        window.opener.postMessage(
          `authorization:${oauthData.provider}:success:${JSON.stringify(payload)}`,
          window.location.origin
        )
        window.close()
        return
      }

      // Fallback: reached this URL without an opener (e.g. opened
      // directly). Persist the token locally so a manual reload can pick
      // it up, then clean the sensitive params out of the address bar.
      localStorage.setItem('sveltia-cms:local-provider-token', oauthData.token)
      localStorage.setItem(
        'decap-cms:user',
        JSON.stringify({ token: oauthData.token, backendName: 'github' })
      )
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    if (loadError) {
      cmsError = loadError
      return
    }

    // Case 2: this window was opened via window.open() by Sveltia CMS's
    // GitHub backend (base_url/auth_endpoint point back at this same
    // route) and has no OAuth result yet — start the Appwrite redirect.
    if (window.opener) {
      try {
        await triggerAppwriteOAuth()
      } catch (err) {
        cmsError = err?.message || err
        console.error('Failed to start Appwrite OAuth redirect:', err)
      }
      return
    }

    // Case 3: normal top-level load of the CMS admin page.
    try {
      const sveltia = await import('@sveltia/cms')
      const CMS = sveltia.default

      if (cmsConfig) {
        cmsConfig.load_config_file = false

        // Initialize Sveltia CMS GUI container. Sveltia's own GitHub
        // backend handles opening the login popup and listening for the
        // "authorization:github:success:..." message — no extra manual
        // message listener is needed here.
        await CMS.init({ config: cmsConfig })

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
    <div
      role="status"
      aria-busy="true"
      class="text-center text-lg text-gray-950 font-bold dark:text-gray-50"
    >
      <p>Đang tải Hệ thống quản lý nội dung…</p>
    </div>
  {:else if oauthData}
    <div role="status" class="text-center text-lg text-emerald-600 font-bold">
      <p>Xác thực thành công! Đang đồng bộ hóa quyền hạn...</p>
    </div>
  {:else}
    <div id="sveltia-cms"></div>
  {/if}
</main>
