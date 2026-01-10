<script>
	import SkipLink from './SkipLink.svelte';
	import Logo from './Logo.svelte';
	import Menu from './Menu.svelte';
	let { data, pages } = $props();
</script>

<header class="w-full bg-white">
  <div class="w-full">
    <div class="max-w-[1340px] mx-auto px-[clamp(30px,5vw,50px)]">
      <div class="flex items-center justify-between flex-nowrap w-full py-5">
        <!-- Site Title -->
	<SkipLink />
	  <Logo pages={data.pages} />
                <!-- Navigation -->
        <div class="flex items-center justify-end flex-nowrap gap-2.5">
			<Menu {pages} />
        </div>
      </div>
    </div>
  </div>
</header>