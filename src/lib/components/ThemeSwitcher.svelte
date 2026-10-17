<script>
  import { onMount } from 'svelte'

  let theme = $state('light')

  onMount(() => {
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme-preference')

    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

    theme = savedTheme || systemTheme

    // Only apply if the current state doesn't match the desired theme
    const isDarkMode = document.documentElement.classList.contains('dark')
    if ((theme === 'dark' && !isDarkMode) || (theme === 'light' && isDarkMode)) {
      applyTheme(theme)
    }
  })

  /** @param {string} newTheme */
  function applyTheme(newTheme) {
    const root = document.documentElement
    // Switch every colour at once instead of animating hundreds of elements (and the large page
    // card) through a transition: that made the toggle stutter, most visibly in full screen.
    root.classList.add('theme-switching')
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove('theme-switching'))
    )

    localStorage.setItem('theme-preference', newTheme)
    theme = newTheme
  }

  function toggleTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    applyTheme(nextTheme)
  }
</script>

<button
  onclick={toggleTheme}
  class="min-h-[48px] min-w-[48px] flex items-center justify-center border border-gray-200 rounded-xl bg-gray-50 p-3 text-gray-950 shadow-sm transition-[background-color,color,border-color,box-shadow] duration-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-800 dark:hover:text-sky-400 dark:focus:ring-sky-400"
  aria-label="Bật chế độ tối"
  aria-pressed={theme === 'dark'}
>
  {#if theme === 'light'}
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
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
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  {/if}
</button>
