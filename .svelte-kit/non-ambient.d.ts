
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/(app)/(include)" | "/(app)" | "/" | "/admin" | "/(app)/blog" | "/(app)/blog/category" | "/(app)/blog/category/[category]" | "/(app)/blog/tag" | "/(app)/blog/tag/[tag]" | "/(app)/blog/[post]" | "/(app)/(include)/cmsConfig.json" | "/(app)/contact" | "/(app)/(include)/oauth" | "/(app)/(include)/oauth/callback" | "/(app)/(include)/rss.xml" | "/(app)/(include)/sitemap.xml" | "/(app)/[page]";
		RouteParams(): {
			"/(app)/blog/category/[category]": { category: string };
			"/(app)/blog/tag/[tag]": { tag: string };
			"/(app)/blog/[post]": { post: string };
			"/(app)/[page]": { page: string }
		};
		LayoutParams(): {
			"/(app)/(include)": Record<string, never>;
			"/(app)": { category?: string; tag?: string; post?: string; page?: string };
			"/": { category?: string; tag?: string; post?: string; page?: string };
			"/admin": Record<string, never>;
			"/(app)/blog": { category?: string; tag?: string; post?: string };
			"/(app)/blog/category": { category?: string };
			"/(app)/blog/category/[category]": { category: string };
			"/(app)/blog/tag": { tag?: string };
			"/(app)/blog/tag/[tag]": { tag: string };
			"/(app)/blog/[post]": { post: string };
			"/(app)/(include)/cmsConfig.json": Record<string, never>;
			"/(app)/contact": Record<string, never>;
			"/(app)/(include)/oauth": Record<string, never>;
			"/(app)/(include)/oauth/callback": Record<string, never>;
			"/(app)/(include)/rss.xml": Record<string, never>;
			"/(app)/(include)/sitemap.xml": Record<string, never>;
			"/(app)/[page]": { page: string }
		};
		Pathname(): "/" | "/admin/" | "/blog/" | "/blog/category/" | `/blog/category/${string}` & {} | `/blog/category/${string}/` & {} | "/blog/tag/" | `/blog/tag/${string}` & {} | `/blog/tag/${string}/` & {} | `/blog/${string}` & {} | `/blog/${string}/` & {} | "/cmsConfig.json" | "/contact/" | "/oauth" | "/oauth/callback" | "/rss.xml" | "/sitemap.xml" | `/${string}` & {} | `/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/ads.txt" | "/background.jpg" | "/favicon.ico" | "/logo.svg" | "/manifest.json" | "/robots.txt" | string & {};
	}
}