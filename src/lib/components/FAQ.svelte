<script>
  import { serializeSchema } from '$lib/utils/seo'

  /**
   * @typedef {Object} FAQItem
   * @property {string} question
   * @property {string} answer
   */

  /** @type {{ items: FAQItem[] }} */
  let { items = [] } = $props()

  const faqJsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  })
</script>

<svelte:head>
  {#if items.length > 0}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html serializeSchema(faqJsonLd)}
  {/if}
</svelte:head>

{#if items.length > 0}
  <section
    class="my-12 border border-gray-100 rounded-3xl bg-gray-50 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
  >
    <h2 class="mb-8 flex items-center gap-3 text-2xl text-gray-950 font-bold dark:text-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-sky-800 dark:text-sky-400"
        aria-hidden="true"
        ><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
        ></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg
      >
      Câu hỏi thường gặp
    </h2>

    <div class="space-y-6">
      {#each items as item (item.question)}
        <div class="border-b border-gray-200 pb-6 last:border-0 dark:border-gray-800 last:pb-0">
          <h3 class="mb-2 text-lg text-gray-950 font-black dark:text-gray-50">
            {item.question}
          </h3>
          <div class="text-gray-950 font-bold leading-relaxed dark:text-gray-50">
            {item.answer}
          </div>
        </div>
      {/each}
    </div>
  </section>
{/if}
