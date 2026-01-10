<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let isVisible = $state(false);

	function handleKeyDown(e) {
		if (e.key === 'Tab') {
			isVisible = true;
		}
	}

	function handleMouseMove() {
		isVisible = false;
	}

	onMount(() => {
		if (!browser) return;

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('mousemove', handleMouseMove);
	});

	onDestroy(() => {
		if (!browser) return;

		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('mousemove', handleMouseMove);
	});
</script>

<a
	href="#main-content"
	class={`fixed top-3 left-3 z-[9999] flex items-center gap-2 rounded-full bg-gray-900 text-white text-xs font-semibold px-4 py-2 tracking-[0.12em] shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-400 transition-all duration-300 ease-out ${
		isVisible
			? 'opacity-100 translate-y-0 pointer-events-auto'
			: 'opacity-0 -translate-y-3 pointer-events-none'
	}`}
	aria-label="Chuyển đến nội dung chính"
>
	<!-- Braille shimmer -->
	<span class="flex gap-[4px] animate-pulse">
		<span class="w-2 h-2 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
		<span class="w-2 h-2 rounded-full bg-white/60 shadow-[0_0_6px_rgba(255,255,255,0.5)]"></span>
		<span class="w-2 h-2 rounded-full bg-white/40 shadow-[0_0_4px_rgba(255,255,255,0.3)]"></span>
	</span>
	<span>Chuyển đến nội dung chính</span>
</a>
