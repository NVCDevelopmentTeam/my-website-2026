const DONE_FLAG = 'service-worker-retired'

/**
 * The site used to register a caching service worker; caching is now done by the server.
 * Removes it from browsers that still have it: unregisters every worker, deletes the caches
 * it created and reloads once if the page was still controlled by it (a controlled page keeps
 * using the worker until it is reloaded). Runs once per browser — the flag is stored after a
 * successful pass, so later visits cost one localStorage read.
 *
 * Also clears the leftovers that a worker from a production preview can cause on the dev
 * server (same origin), which showed up as blank pages while `pnpm dev` was compiling.
 */
export async function retireServiceWorkers() {
  try {
    if (!('serviceWorker' in navigator) || localStorage.getItem(DONE_FLAG)) return

    const wasControlled = !!navigator.serviceWorker.controller
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))

    if (registrations.length > 0 && 'caches' in window) {
      await Promise.all((await caches.keys()).map((key) => caches.delete(key)))
    }

    localStorage.setItem(DONE_FLAG, '1')
    if (wasControlled) location.reload()
  } catch {
    // Storage or service workers unavailable (private mode…): nothing to clean up
  }
}
