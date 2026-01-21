<!-- src/routes/admin/+page.svelte -->
<svelte:head>
  <title>Admin | Sveltia CMS</title>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</svelte:head>

<main>
  <h1>Loading Sveltia CMS...</h1>
</main>

<script>
  /* global CMS */
  import { onMount } from 'svelte';

  onMount(() => {
    // Initialize the CMS
    CMS.init();
  });
</script>
