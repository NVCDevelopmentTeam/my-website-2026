<script>
    import SkipLink from './SkipLink.svelte';
    import Logo from './Logo.svelte';
    import Menu from './Menu.svelte';
    import ThemeSwitcher from './ThemeSwitcher.svelte';

    /** @type {Object} Props */
    let { allPages = [], navPages = [] } = $props();
  </script>
  
  <header class="w-full bg-white/90 dark:bg-gray-950/90 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-md transition-colors">
    <div class="w-full">
      <div class="max-w-[1340px] mx-auto px-[clamp(16px,5vw,50px)]">
        <div class="flex items-center justify-between flex-nowrap w-full py-4">
          <SkipLink />
  
          <Logo pages={allPages} />
  
          <nav class="flex items-center justify-end flex-nowrap gap-4">
            <ThemeSwitcher />
            <Menu {navPages} />
          </nav>
        </div>
      </div>
    </div>
  </header>

