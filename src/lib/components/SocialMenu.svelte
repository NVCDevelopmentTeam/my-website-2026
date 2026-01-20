<script>
  import { siteConfig } from '$lib/config';
</script>

<div class="space-y-3">
  <h4 class="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Kết nối với mình</h4>
  <ul class="flex flex-wrap gap-4">
    {#if siteConfig.social.facebook && siteConfig.social.facebook !== '/'}
      <li>
        <a href={siteConfig.social.facebook} class="text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors" aria-label="Facebook">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-4h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
        </a>
      </li>
    {/if}
    {#if siteConfig.social.github && siteConfig.social.github !== '/'}
      <li>
        <a href={siteConfig.social.github} class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 3.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.71c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 0 0-.94 2.58V22"></path></svg>
        </a>
      </li>
    {/if}
    <!-- Add other social links as needed -->
  </ul>
</div>
