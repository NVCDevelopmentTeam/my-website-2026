<script>
  import Contact from '$lib/components/Contact.svelte';
  import PageContent from '$lib/components/PageContent.svelte';
  let { data } = $props();
</script>

<PageContent {data} />
  <Contact />

