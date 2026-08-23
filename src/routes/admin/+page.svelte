<script>
  import { siteConfig } from '$lib/config'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'

  // Bind properties correctly as reactive state proxy object in Svelte 5
  let props = $props()

  // Derive reactive config values to completely fix the state_referenced_locally warning
  const cmsConfig = $derived(props?.data?.config)
  const loadError = $derived(props?.data?.error)

  let cmsInitialized = $state(false)
  let cmsError = $state(null)

  // Subdue schema prompt alerts inside console logs before module evaluation begins
  if (browser) {
    const originalConsoleInfo = console.info
    console.info = function (...args) {
      if (args && typeof args === 'string' && args.includes('validate your configuration file')) {
        return
      }
      originalConsoleInfo.apply(console, args)
    }
  }

  onMount(async () => {
    if (!browser) return

    // Evaluate derived reactive status constraints
    if (loadError) {
      cmsError = loadError
      return
    }

    if (!cmsConfig) {
      cmsError = 'Configuration object is undefined or corrupted.'
      return
    }

    try {
      // Async injection of the central content manager controller core
      const sveltia = await import('@sveltia/cms')
      const CMS = sveltia.default

      // Hardcode the suppression argument right before init to secure core engine configuration injection
      cmsConfig.load_config_file = false

      // Initialize utilizing the verified configuration object to resolve InvalidStateError
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

<!-- Accessibility (ARIA) Semantic Wrappers optimized for Screen Reader devices -->
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
      class="text-center text-lg font-bold text-gray-950 dark:text-gray-50"
    >
      <p>Đang tải Hệ thống quản lý nội dung…</p>
    </div>
  {:else}
    <!-- Target destination node where the graphical dashboard safely anchors -->
    <div id="sveltia-cms"></div>
  {/if}
</main>
