<script>
  // On static hosting an unknown URL is answered with 404.html, so the app boots in the
  // browser and fails while loading the root layout's data (its __data.json does not
  // exist). Errors at that level are rendered by this root error page, outside every
  // layout — without it SvelteKit falls back to a bare "404 Not Found".
  //
  // The designed error page is imported on demand: SvelteKit downloads this root error
  // node on EVERY page view, so statically importing the page (and its stylesheet) here
  // added three requests to every visit just to be ready for an error that rarely happens.
  const errorPage = import('./(app)/+error.svelte')
</script>

{#await errorPage then { default: ErrorPage }}
  <ErrorPage />
{/await}
