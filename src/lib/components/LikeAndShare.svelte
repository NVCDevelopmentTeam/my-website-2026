<script>
  import { onMount } from 'svelte'
  import { page } from '$app/state'

  let likes = $state(0)
  let hasLiked = $state(false)
  let copySuccess = $state(false)
  let dialog = $state()

  const storageKey = $derived(`likes_${page.url.pathname}`)
  const userKey = $derived(`hasLiked_${page.url.pathname}`)

  /**
   * Generate a lightweight browser fingerprint for duplicate-like prevention.
   * @returns {string}
   */
  function getBrowserFingerprint() {
    try {
      var parts = []

      // Canvas fingerprint
      var canvas = document.createElement('canvas')
      canvas.width = 200
      canvas.height = 50
      var ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillStyle = '#f60'
        ctx.fillRect(125, 1, 62, 20)
        ctx.fillStyle = '#069'
        ctx.fillText('Fingerprint', 2, 15)
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
        ctx.fillText('Canvas', 4, 35)
        parts.push(canvas.toDataURL().slice(-50))
      }

      // Screen characteristics
      parts.push(screen.width + 'x' + screen.height)
      parts.push(screen.colorDepth + '')
      parts.push(navigator.language || '')
      parts.push(navigator.hardwareConcurrency + '')
      parts.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '')

      // Simple hash
      var str = parts.join('|')
      var hash = 0
      for (var i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
      }
      return 'fp_' + Math.abs(hash).toString(36)
    } catch {
      return 'fp_fallback'
    }
  }

  /**
   * Get cookie value by name
   * @param {string} name
   * @returns {string|null}
   */
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? match[2] : null
  }

  /**
   * Set a persistent cookie.
   * @param {string} name
   * @param {string} value
   */
  function setCookie(name, value) {
    document.cookie = name + '=' + value + '; max-age=31536000; path=/; SameSite=Lax'
  }

  /**
   * Check if the current visitor has already liked this page.
   * Triple-check: localStorage + cookie + browser fingerprint. This is
   * intentionally client-side only — the site is static with no backend,
   * so it can be bypassed by clearing storage or using incognito mode.
   * @param {string} fingerprint
   * @returns {boolean}
   */
  function checkAlreadyLiked(fingerprint) {
    var inStorage = localStorage.getItem(userKey) === 'true'
    var inCookie = getCookie(userKey) === 'true'
    var fingerprintKey = userKey + '_' + fingerprint
    var inFpStorage = localStorage.getItem(fingerprintKey) === 'true'
    return inStorage || inCookie || inFpStorage
  }

  /**
   * Persist the liked state across all mechanisms.
   * @param {string} fingerprint
   */
  function persistLiked(fingerprint) {
    try {
      setCookie(userKey, 'true')
      localStorage.setItem(userKey, 'true')
      localStorage.setItem(storageKey, likes.toString())
      var fingerprintKey = userKey + '_' + fingerprint
      localStorage.setItem(fingerprintKey, 'true')
      setCookie(fingerprintKey, 'true')
    } catch {
      // localStorage may be blocked (privacy mode)
    }
  }

  /**
   * Handle like action — each visitor can only like once per page.
   */
  function toggleLike() {
    if (hasLiked) return

    var fingerprint = getBrowserFingerprint()

    if (checkAlreadyLiked(fingerprint)) {
      hasLiked = true
      return
    }

    likes += 1
    hasLiked = true
    persistLiked(fingerprint)
  }

  // Open the sharing dialog modal
  function openDialog() {
    if (dialog && typeof dialog.showModal === 'function') {
      dialog.showModal()
    }
  }

  // Close the sharing dialog
  function closeDialog() {
    if (dialog && typeof dialog.close === 'function') {
      dialog.close()
    }
  }

  // Handle backdrop click to dismiss modal
  function handleDialogClick(event) {
    if (event.target === dialog) {
      closeDialog()
    }
  }

  // Helper for opening share popups centered
  function openSharePopup(url) {
    if (typeof window === 'undefined') return
    const width = 620
    const height = 580
    const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX)
    const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY)
    window.open(
      url,
      'share-dialog',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    )
    closeDialog()
  }

  // Share on Facebook
  function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href)
    openSharePopup(`https://www.facebook.com/sharer/sharer.php?u=${url}`)
  }

  // Share on Zalo
  function shareOnZalo() {
    const url = encodeURIComponent(window.location.href)
    openSharePopup(`https://chat.zalo.me/share/url?url=${url}`)
  }

  // Share on Messenger
  function shareOnMessenger() {
    const url = encodeURIComponent(window.location.href)
    openSharePopup(
      `https://www.facebook.com/dialog/send?link=${url}&app_id=291494419107518&redirect_uri=${url}`
    )
  }

  // Share on Telegram
  function shareOnTelegram() {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(document.title)
    openSharePopup(`https://t.me/share/url?url=${url}&text=${text}`)
  }

  // Share on X (Twitter)
  function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(document.title)
    openSharePopup(`https://twitter.com/intent/tweet?url=${url}&text=${text}`)
  }

  // Native share option inside dialog
  async function triggerNativeShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href
        })
        closeDialog()
      } catch (err) {
        if (err.name !== 'AbortError') console.warn(err)
      }
    }
  }

  // Copy link to clipboard with visual feedback
  async function copyLink() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = window.location.href
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      copySuccess = true
      setTimeout(function () {
        copySuccess = false
      }, 2000)
    } catch (err) {
      console.warn('Failed to copy link:', err)
    }
  }

  // Restore like state from localStorage/cookie/fingerprint on mount.
  // Deferred 300ms — fingerprint computation (canvas API) is expensive and non-critical.
  onMount(function () {
    setTimeout(function () {
      try {
        var savedLikes = localStorage.getItem(storageKey)
        if (savedLikes) {
          likes = parseInt(savedLikes, 10) || 0
        }

        var fingerprint = getBrowserFingerprint()
        if (checkAlreadyLiked(fingerprint)) {
          hasLiked = true
        }
      } catch {
        // Storage blocked — silently continue
      }
    }, 300)
  })
</script>

<div
  class="flex flex-wrap items-center gap-3 border-y border-gray-200 py-3 sm:py-4 dark:border-gray-800"
>
  <!-- Facebook-Style Like Button -->
  <button
    onclick={toggleLike}
    disabled={hasLiked}
    class="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all select-none {hasLiked
      ? 'cursor-default bg-[#E7F3FF] text-[#0866FF] dark:bg-[#0866FF]/20 dark:text-[#4599FF]'
      : 'bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6E9] active:scale-95 dark:bg-[#3A3B3C] dark:text-[#E4E6EB] dark:hover:bg-[#4E4F50]'}"
    aria-label="Thích bài viết, hiện có {likes} lượt thích"
    aria-pressed={hasLiked}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={hasLiked ? 'currentColor' : 'none'}
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path
        d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
      ></path>
    </svg>
    <span>{hasLiked ? 'Đã thích' : 'Thích'}</span>
    {#if likes > 0}
      <span class="rounded-full bg-black/5 px-2 py-0.5 text-xs font-bold dark:bg-white/10"
        >{likes}</span
      >
    {/if}
  </button>

  <!-- Facebook-Style Share Button -->
  <button
    onclick={openDialog}
    class="inline-flex items-center gap-2 rounded-md bg-[#F0F2F5] px-4 py-2 text-sm font-semibold text-[#050505] transition-all select-none hover:bg-[#E4E6E9] active:scale-95 dark:bg-[#3A3B3C] dark:text-[#E4E6EB] dark:hover:bg-[#4E4F50]"
    aria-label="Chia sẻ bài viết"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
      <polyline points="16 6 12 2 8 6"></polyline>
      <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
    <span>Chia sẻ</span>
  </button>

  <!-- Facebook App Style Share Modal Dialog -->
  <dialog
    bind:this={dialog}
    onclick={handleDialogClick}
    aria-labelledby="dialog-title"
    aria-modal="true"
    class="w-full max-w-sm overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-xs dark:bg-[#242526]"
  >
    <div class="p-5">
      <!-- Modal Header -->
      <div
        class="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700"
      >
        <h2 id="dialog-title" class="text-base font-bold text-gray-900 dark:text-gray-100">
          Chia sẻ lên
        </h2>
        <button
          onclick={closeDialog}
          aria-label="Đóng"
          class="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Main Popular Channels in Vietnam (Facebook Mobile Style) -->
      <div class="grid grid-cols-3 gap-3">
        <!-- Facebook -->
        <button
          onclick={shareOnFacebook}
          class="flex flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center transition-colors hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-[#0866FF] text-white shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
          </div>
          <span class="text-xs font-medium text-gray-800 dark:text-gray-200">Facebook</span>
        </button>

        <!-- Messenger -->
        <button
          onclick={shareOnMessenger}
          class="flex flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center transition-colors hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#00C6FF] to-[#0078FF] text-white shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 0C5.373 0 0 4.974 0 11.111c0 3.497 1.745 6.616 4.47 8.653V24l4.086-2.242c1.09.301 2.246.464 3.444.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.259 5.888-3.259-6.559 6.963z"
              />
            </svg>
          </div>
          <span class="text-xs font-medium text-gray-800 dark:text-gray-200">Messenger</span>
        </button>

        <!-- Zalo -->
        <button
          onclick={shareOnZalo}
          class="flex flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center transition-colors hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-[#0068FF] text-xs font-black tracking-tighter text-white italic shadow-sm"
          >
            Zalo
          </div>
          <span class="text-xs font-medium text-gray-800 dark:text-gray-200">Zalo</span>
        </button>

        <!-- Telegram -->
        <button
          onclick={shareOnTelegram}
          class="flex flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center transition-colors hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.197 1.006.128.832.946z"
              />
            </svg>
          </div>
          <span class="text-xs font-medium text-gray-800 dark:text-gray-200">Telegram</span>
        </button>

        <!-- X (Twitter) -->
        <button
          onclick={shareOnTwitter}
          class="flex flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center transition-colors hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-sm dark:bg-white dark:text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </div>
          <span class="text-xs font-medium text-gray-800 dark:text-gray-200">X (Twitter)</span>
        </button>

        <!-- Sao chép liên kết button -->
        <button
          onclick={copyLink}
          class="flex flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center transition-colors hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-800"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition-all {copySuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-[#E4E6EB] text-gray-800 dark:bg-[#3A3B3C] dark:text-gray-100'}"
          >
            {#if copySuccess}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            {/if}
          </div>
          <span
            class="text-xs font-medium {copySuccess
              ? 'font-bold text-emerald-600 dark:text-emerald-400'
              : 'text-gray-800 dark:text-gray-200'}"
          >
            {copySuccess ? 'Đã sao chép!' : 'Sao chép link'}
          </span>
        </button>
      </div>

      <!-- Native Share for other apps -->
      <div class="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
        <button
          onclick={triggerNativeShare}
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 active:scale-98 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>Tùy chọn khác...</span>
        </button>
      </div>
    </div>
  </dialog>
</div>
