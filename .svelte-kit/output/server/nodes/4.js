import * as universal from '../entries/pages/admin/_layout.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/admin/+layout.js";
export const imports = ["_app/immutable/nodes/4.CvsQBgRD.js","_app/immutable/chunks/DN1fDwAb.js","_app/immutable/chunks/Bl2mQXnC.js","_app/immutable/chunks/6oJg6312.js"];
export const stylesheets = [];
export const fonts = [];
