import * as universal from '../entries/pages/(app)/blog/_post_/_page.js';
import * as server from '../entries/pages/(app)/blog/_post_/_page.server.js';

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/blog/_post_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/(app)/blog/[post]/+page.js";
export { server };
export const server_id = "src/routes/(app)/blog/[post]/+page.server.js";
export const imports = ["_app/immutable/nodes/11.BfAIUd3C.js","_app/immutable/chunks/B1Ib3Rlr.js","_app/immutable/chunks/DN1fDwAb.js","_app/immutable/chunks/6oJg6312.js","_app/immutable/chunks/rbKpLrNQ.js","_app/immutable/chunks/CKTlASjS.js","_app/immutable/chunks/Cw1OXyQU.js","_app/immutable/chunks/CXl__1c6.js"];
export const stylesheets = [];
export const fonts = [];
