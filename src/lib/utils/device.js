/**
 * True on weak phones (2 GB of memory or less) and on slow or metered connections (Data Saver,
 * 2G): the places that skip what is only nice to have there (page transitions, extra preloading).
 * Browsers that do not report these values are treated as capable.
 */
export function isLightMode() {
  /** @type {any} */
  const nav = navigator
  const connection = nav.connection
  return (
    connection?.saveData === true ||
    /(^|-)2g$/.test(connection?.effectiveType ?? '') ||
    (nav.deviceMemory ?? 8) <= 2
  )
}
