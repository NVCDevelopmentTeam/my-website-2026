<script>
  import SkipLink from './SkipLink.svelte'
  import Logo from './Logo.svelte'
  import Menu from './Menu.svelte'
  import ThemeSwitcher from './ThemeSwitcher.svelte'

  /** @type {{ navPages?: any[] }} */
  let { navPages = [] } = $props()
</script>

<header
  class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white transition-colors dark:border-gray-800 dark:bg-gray-950"
>
  <div class="w-full">
    <div class="mx-auto max-w-[1340px] px-[clamp(16px,5vw,50px)]">
      <div class="w-full flex flex-wrap items-center justify-between gap-y-2 py-4">
        <SkipLink />

        <Logo />

        <div class="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <ThemeSwitcher />
          <Menu {navPages} />
        </div>
      </div>
    </div>
  </div>
</header>
