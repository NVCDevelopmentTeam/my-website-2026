<script>
	import { siteConfig } from '$lib/config';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let cmsInitialized = $state(false);
	let cmsError = $state(null);

	onMount(async () => {
		if (!browser) return;

		try {
			const sveltia = await import('@sveltia/cms');
			const CMS = sveltia.default;

			// Do NOT pass config
			// Sveltia will automatically fetch /admin/config
			await CMS.init();

			cmsInitialized = true;
		} catch (err) {
			cmsError = err;
			console.error('CMS Initialization Error:', err);
		}
	});
</script>

<svelte:head>
	<title>Bản điều khiển | {siteConfig.title}</title>
	<meta name="description" content={siteConfig.description} />
</svelte:head>

{#if cmsError}
	<div class="text-red-500 text-center mt-10">
		<h2 class="text-2xl font-bold">Khởi tạo CMS thất bại</h2>
		<p class="mt-2">{cmsError.message}</p>
	</div>
{:else if !cmsInitialized}
	<div class="text-center text-lg mt-10">
		<p>Đang tải Hệ thống quản lý nội dung…</p>
	</div>
{:else}
	<div id="sveltia-cms" class="mt-10"></div>
{/if}
