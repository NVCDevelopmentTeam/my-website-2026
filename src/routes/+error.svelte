<script>
  // On static hosting an unknown URL is answered with 404.html, so the app boots in the
  // browser and fails while loading the root layout's data (its __data.json does not
  // exist). Errors at that level are rendered by this root error page, outside every
  // layout — without it SvelteKit falls back to a bare "404 Not Found".
  // Reuse the site's designed error page.
  import ErrorPage from './(app)/+error.svelte'
</script>

<ErrorPage />
