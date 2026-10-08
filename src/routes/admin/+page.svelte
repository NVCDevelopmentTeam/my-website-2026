<script>
  import { siteConfig } from '#lib/config.js'
  import { onMount } from 'svelte'
  import { browser } from '$app/env'
  import { installUint8ArrayPolyfill } from '#lib/utils/uint8array-polyfill.js'

  let props = $props()
  const cmsConfig = $derived(props?.data?.config)

  let cmsInitialized = $state(false)
  /** @type {string | null} */
  let cmsError = $state(null)

  // Mute Sveltia's "validate your configuration file" console.info notice
  // (the config is passed inline, so there is no config file to validate).
  if (browser) {
    const originalConsoleInfo = console.info
    console.info = function (...args) {
      if (typeof args[0] === 'string' && args[0].includes('validate your configuration file')) {
        return
      }
      originalConsoleInfo.apply(console, args)
    }
  }

  onMount(async () => {
    if (!browser) return

    try {
      // Sveltia CMS ≥ 0.229 needs Uint8Array.toHex/toBase64/fromHex/fromBase64
      installUint8ArrayPolyfill()

      // Loaded only on /admin, never as part of the public site's JS.
      const sveltia = await import('@sveltia/cms')
      const CMS = sveltia.default

      if (cmsConfig) {
        // Sveltia's GitHub backend opens the login popup itself and talks to
        // Netlify's OAuth endpoint (api.netlify.com) — no custom handling needed.
        await CMS.init({ config: cmsConfig })
        cmsInitialized = true
      }
    } catch (err) {
      cmsError = err instanceof Error ? err.message : String(err)
      console.error('CMS Runtime Mount Exception:', err)
    }
  })
</script>

<svelte:head>
  <title>Bản điều khiển | {siteConfig.title}</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="mt-10 px-4" aria-live="polite">
  {#if cmsError}
    <div role="alert" class="text-center text-red-800 dark:text-red-400">
      <h2 class="text-2xl font-black">Khởi tạo CMS thất bại</h2>
      <p class="mt-2 font-bold">{cmsError}</p>
    </div>
  {:else if !cmsInitialized}
    <div
      role="status"
      aria-busy="true"
      class="text-center text-lg text-gray-950 font-bold dark:text-gray-50"
    >
      <p>Đang tải Hệ thống quản lý nội dung…</p>
    </div>
  {:else}
    <div id="sveltia-cms"></div>
  {/if}
</main>
