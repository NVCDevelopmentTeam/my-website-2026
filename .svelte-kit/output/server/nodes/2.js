import * as server from '../entries/pages/(app)/_layout.server.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/(app)/+layout.server.js";
export const imports = ["_app/immutable/nodes/2.BlF69Zrp.js","_app/immutable/chunks/DN1fDwAb.js","_app/immutable/chunks/Bl2mQXnC.js","_app/immutable/chunks/6oJg6312.js","_app/immutable/chunks/Cw1OXyQU.js"];
export const stylesheets = [];
export const fonts = [];
