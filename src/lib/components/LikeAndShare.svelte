<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let likes = $state(0);
	let dialog = $state();

	const storageKey = $derived(`likes_${page.url.pathname}`);

	// Increase the number of likes
	const incrementLikes = () => {
		likes += 1;
	};

	// Save likes to localStorage whenever 'likes' changes
	$effect(() => {
		// Debounce saving to localStorage
		const debounceTimer = setTimeout(() => {
			if (likes > 0) {
				try {
					localStorage.setItem(storageKey, likes.toString());
				} catch (error) {
					console.error('Error saving to localStorage:', error);
				}
			}
		}, 500);

		// Cleanup function for the effect
		return () => clearTimeout(debounceTimer);
	});

	// Open the sharing dialog box
	const openDialog = () => {
		dialog.showModal();
	};

	// Close the sharing dialog
	const closeDialog = () => {
		dialog.close();
	};

	// Share on Facebook
	const shareOnFacebook = () => {
		const url = encodeURIComponent(window.location.href);
		window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
		closeDialog();
	};

	// Share on Zalo
	const shareOnZalo = () => {
		const url = encodeURIComponent(window.location.href);
		window.open(`https://chat.zalo.me/share/url?url=${url}`, '_blank');
		closeDialog();
	};

	// Share on Twitter
	const shareOnTwitter = () => {
		const url = encodeURIComponent(window.location.href);
		const text = encodeURIComponent('Xem ngay nội dung thú vị này!');
		window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
		closeDialog();
	};

	// Share on LinkedIn
	const shareOnLinkedIn = () => {
		const url = encodeURIComponent(window.location.href);
		window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
		closeDialog();
	};

	// Copy link
	const copyLink = () => {
		navigator.clipboard
			.writeText(window.location.href)
			.then(() => alert('Đã sao chép liên kết thành công!'))
			.catch((err) => console.error('Lỗi khi sao chép liên kết:', err));
		closeDialog();
	};

	// Initialize likes from localStorage on page load
	onMount(() => {
		try {
			const savedLikes = localStorage.getItem(storageKey);
			if (savedLikes) {
				likes = parseInt(savedLikes, 10) || 0;
			}
		} catch (error) {
			console.error('Error reading from localStorage:', error);
		}
	});
</script>

<div class="flex flex-col sm:flex-row items-center gap-4 py-6 border-y border-gray-100 dark:border-gray-800">
	<div class="flex items-center gap-3">
		<button
			onclick={incrementLikes}
			class="flex items-center gap-2 px-6 py-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-400 font-bold rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-95 shadow-sm border border-rose-100 dark:border-rose-900/50"
			aria-label="Thích bài viết này"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={likes > 0 ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
			<span>{likes}</span>
		</button>
	</div>

	<div class="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

	<button
		onclick={openDialog}
		class="flex items-center gap-2 px-6 py-2.5 bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-400 font-bold rounded-2xl hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all active:scale-95 shadow-sm border border-sky-100 dark:border-sky-900/50"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
		Chia sẻ
	</button>

	<dialog
		bind:this={dialog}
		aria-labelledby="dialog-title"
		aria-modal="true"
		class="p-0 rounded-3xl shadow-2xl backdrop:bg-gray-950/60 backdrop:backdrop-blur-sm border-0 bg-white dark:bg-gray-900 overflow-hidden w-full max-w-md"
	>
		<div class="p-8">
			<div class="flex items-center justify-between mb-8">
				<h2 id="dialog-title" class="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">Chia sẻ bài viết</h2>
				<button
					onclick={closeDialog}
					aria-label="Đóng hộp thoại"
					class="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-800 dark:text-gray-400"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
				</button>
			</div>
			
			<div class="grid grid-cols-1 gap-3">
				<button
					onclick={shareOnFacebook}
					class="flex items-center gap-4 px-5 py-4 rounded-2xl text-white font-bold transition-all bg-[#0866FF] hover:bg-[#0052CC] active:scale-[0.98] shadow-lg shadow-blue-500/20"
				>
					<div class="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
					</div>
					Facebook
				</button>
				
				<button
					onclick={shareOnZalo}
					class="flex items-center gap-4 px-5 py-4 rounded-2xl text-white font-bold transition-all bg-[#0068FF] hover:bg-[#0052CC] active:scale-[0.98] shadow-lg shadow-blue-500/20"
				>
					<div class="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg font-black text-xs italic">Zalo</div>
					Zalo
				</button>

				<div class="grid grid-cols-2 gap-3">
					<button
						onclick={shareOnTwitter}
						class="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-white font-bold transition-all bg-[#000000] dark:bg-[#FFFFFF] dark:text-[#000000] hover:opacity-90 active:scale-[0.98]"
					>
						X (Twitter)
					</button>
					<button
						onclick={shareOnLinkedIn}
						class="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-white font-bold transition-all bg-[#0077B5] hover:bg-[#005582] active:scale-[0.98]"
					>
						LinkedIn
					</button>
				</div>
				
				<button
					onclick={copyLink}
					class="mt-2 flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-gray-800 dark:text-gray-200 font-bold transition-all bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] border border-gray-200 dark:border-gray-700"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
					Sao chép liên kết
				</button>
			</div>
		</div>
	</dialog>
</div>
