

export const index = 14;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_page.svelte.js')).default;
export const universal = {
  "prerender": true,
  "trailingSlash": "always",
  "csr": true,
  "ssr": false,
  "load": null
};
export const universal_id = "src/routes/admin/+page.js";
export const imports = ["_app/immutable/nodes/14.DBY0nnTm.js","_app/immutable/chunks/B1Ib3Rlr.js","_app/immutable/chunks/DN1fDwAb.js","_app/immutable/chunks/6oJg6312.js"];
export const stylesheets = [];
export const fonts = [];
