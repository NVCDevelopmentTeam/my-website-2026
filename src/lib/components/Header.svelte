<script>
  import SkipLink from './SkipLink.svelte'
  import Logo from './Logo.svelte'
  import Menu from './Menu.svelte'
  import ThemeSwitcher from './ThemeSwitcher.svelte'

  /** @type {Object} Props */
  let { allPages = [], navPages = [] } = $props()
</script>

<header
  class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md transition-colors dark:border-gray-800 dark:bg-gray-950/90"
>
  <div class="w-full">
    <div class="mx-auto max-w-[1340px] px-[clamp(16px,5vw,50px)]">
      <div class="w-full flex flex-nowrap items-center justify-between py-4">
        <SkipLink />

        <Logo pages={allPages} />

        <nav class="flex flex-nowrap items-center justify-end gap-4" aria-label="Site utilities">
          <ThemeSwitcher />
          <Menu {navPages} />
        </nav>
      </div>
    </div>
  </div>
</header>
