export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["ads.txt","favicon.ico","logo.svg","manifest.json","robots.txt","service-worker.js"]),
	mimeTypes: {".txt":"text/plain",".svg":"image/svg+xml",".json":"application/json"},
	_: {
		client: {start:"_app/immutable/entry/start.D4mjkFuM.js",app:"_app/immutable/entry/app.Bxfh0LA5.js",imports:["_app/immutable/entry/start.D4mjkFuM.js","_app/immutable/chunks/DN1fDwAb.js","_app/immutable/entry/app.Bxfh0LA5.js","_app/immutable/chunks/B1Ib3Rlr.js","_app/immutable/chunks/DN1fDwAb.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/(app)/(include)/oauth",
				pattern: /^\/oauth\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/(app)/(include)/oauth/_server.js'))
			},
			{
				id: "/(app)/(include)/oauth/callback",
				pattern: /^\/oauth\/callback\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/(app)/(include)/oauth/callback/_server.js'))
			}
		],
		prerendered_routes: new Set(["/","/__data.json","/cmsConfig.json","/rss.xml","/sitemap.xml","/admin/","/blog/","/blog/__data.json","/blog/category/","/blog/category/__data.json","/blog/tag/","/blog/tag/__data.json","/contact/","/contact/__data.json","/blog/category/cong-nghe/","/blog/category/cong-nghe/__data.json","/blog/category/nghe-nghiep/","/blog/category/nghe-nghiep/__data.json","/blog/tag/ai/","/blog/tag/ai/__data.json","/blog/tag/lap-trinh/","/blog/tag/lap-trinh/__data.json","/blog/tag/tuong-lai/","/blog/tag/tuong-lai/__data.json","/privacy-policy/","/privacy-policy/__data.json","/about/","/about/__data.json","/accessibility-statement/","/accessibility-statement/__data.json","/blog/tuong-lai-nao-cho-nganh-lap-trinh-2025/","/blog/tuong-lai-nao-cho-nganh-lap-trinh-2025/__data.json"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
