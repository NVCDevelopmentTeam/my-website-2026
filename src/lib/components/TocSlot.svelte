<script>
  import { getContext } from 'svelte'
  import ToC from './ToC.svelte'

  /** @type {{ children?: import('svelte').Snippet }} */
  let { children } = $props()

  // mdsvex keeps what its plugins found in the document (here: the headings) in this context
  const data = /** @type {{ current?: { toc?: { headings?: any[] } } } | undefined} */ (
    getContext(Symbol.for('mdsvex.plugin_data'))
  )
  const toc = $derived(
    (data?.current?.toc?.headings ?? []).map(
      (/** @type {{ depth: number, id: string, text: string }} */ h) => ({
        level: h.depth,
        id: h.id,
        title: h.text
      })
    )
  )
</script>

{#if toc.length > 0}
  <div class="not-prose my-10">
    <ToC post={{ toc }} />
  </div>
{/if}

{@render children?.()}
