/** Scroll behaviour for scrolling the page from code: smooth, unless reduced motion is requested. */
export const scrollBehavior = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
