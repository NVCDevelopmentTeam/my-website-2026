import { preloadData } from '$app/navigation'

/**
 * Svelte action: start loading a link's page (code + data) when the link receives keyboard
 * focus. SvelteKit already preloads on mouse hover and touch; without this, keyboard and
 * screen-reader users, who never "hover", wait for the full download after pressing Enter.
 * It only runs once per link and only for same-site links, so it costs nothing until used.
 *
 * @param {HTMLAnchorElement} node
 */
export function preloadOnFocus(node) {
  function preload() {
    const href = node.getAttribute('href')
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      preloadData(href).catch(() => {
        // Preloading is only an optimisation; a normal click still loads the page.
      })
    }
  }

  node.addEventListener('focus', preload, { once: true })
  return {
    destroy() {
      node.removeEventListener('focus', preload)
    }
  }
}
