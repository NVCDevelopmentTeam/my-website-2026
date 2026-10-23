<script>
  import { afterNavigate } from '$app/navigation'
  import { tick } from 'svelte'

  // Announces "page title — site title" after every page change made inside the site. One
  // component for every window size and mode (normal window or browser full screen), so the
  // behaviour is identical everywhere. SvelteKit's own announcer is hidden in layout.css so the
  // title is read once. A full page load is not announced: the browser already does that, and the
  // menu shows the current page.
  //
  // The text is removed again almost at once so that it is not left at the start or end of the
  // page for people who read it line by line.
  let title = $state('')
  /** @type {ReturnType<typeof setTimeout>} */
  let clearTimer

  afterNavigate(async ({ type }) => {
    if (type === 'enter') return
    clearTimeout(clearTimer)
    title = ''
    await tick() // the new page has been rendered, so document.title is the new one
    title = document.title
    clearTimer = setTimeout(() => (title = ''), 500)
  })
</script>

<div role="status" class="sr-only">{title}</div>
