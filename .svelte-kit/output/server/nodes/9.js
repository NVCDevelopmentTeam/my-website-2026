import * as server from '../entries/pages/(app)/blog/tag/_page.server.js';

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/blog/tag/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/(app)/blog/tag/+page.server.js";
export const imports = ["_app/immutable/nodes/9.DSHCtxXC.js","_app/immutable/chunks/DN1fDwAb.js","_app/immutable/chunks/6oJg6312.js"];
export const stylesheets = [];
export const fonts = [];
