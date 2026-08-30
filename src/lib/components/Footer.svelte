<script>
  import { siteConfig } from '$lib/config'
  import LegalMenu from './LegalMenu.svelte'

  /**
   * Svelte 5 Props
   */
  let { pages = [] } = $props()
</script>

<footer
  class="mt-20 border-t border-gray-100 bg-gray-50 text-gray-900 transition-colors virtual dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6">
    <div class="flex flex-col items-start justify-between gap-12 md:flex-row">
      <!-- Minimal navigation -->
      <nav class="space-y-4" aria-labelledby="footer-links-heading">
        <h3
          id="footer-links-heading"
          class="text-sm font-black tracking-widest text-gray-950 uppercase dark:text-gray-50"
        >
          liên kết hữu ích
        </h3>
        <LegalMenu {pages} />
      </nav>

      <!-- Brand & Copyright -->
      <div class="max-w-sm space-y-4">
        <p class="text-sm leading-relaxed font-bold">
          &copy; {new Date().getFullYear()}
          {siteConfig.author.name}. Mọi quyền được bảo lưu. Website được thiết kế đáp ứng tiêu chuẩn
          WCAG 2.2 AAA.
        </p>
      </div>
    </div>

    <!-- Bottom decoration line -->
    <div class="mt-12 flex justify-center border-t border-gray-100 pt-8 dark:border-gray-800">
      <div class="flex gap-3">
        <span class="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-800"></span>
        <span class="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600"></span>
        <span class="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-800"></span>
      </div>
    </div>
  </div>
</footer>
