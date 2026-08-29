<script>
  import { toDisplayDate } from '$lib/utils/date'

  /**
   * RecentPosts — mirrors WordPress Twenty Twenty-Five's block-theme
   * "Recent Posts" pattern: a Query Loop rendered as a plain list
   * (`wp-block-post-template` -> `wp-block-post-title` + `wp-block-post-date`),
   * NOT the old widget's `<ul class="widget_recent_entries">` markup and
   * NOT a card grid. T25 favors flat typography over boxed cards, so the
   * markup/CSS below intentionally stays minimal - no borders-as-cards,
   * no shadows, just spacing and type.
   *
   * -- Svelte 5 runes <-> Vue 3 Composition API -------------------------
   * Each concept below is split out exactly the way you'd split it in a
   * Vue `<script setup>`, one `computed()` per concern instead of one
   * giant transform, so the two codebases stay easy to read side by side:
   *
   *   Svelte 5                        Vue 3 (script setup)
   *   -------------------------------  -------------------------------
   *   let { recentPosts } = $props()   defineProps<{ recentPosts }>()
   *   $derived(expr)                   computed(() => expr)
   *   {#each list as item (key)}       v-for="item in list" :key="item.x"
   *   {#if cond}...{/if}               v-if="cond"
   *
   * As with Vue computed refs, every $derived below must stay a pure,
   * side-effect-free read of its dependencies - never mutate `recentPosts`.
   *
   * @typedef {Object} RawPost
   * @property {string} [slug]
   * @property {string} [title]
   * @property {{ title?: string, date?: string, readingTime?: number, slug?: string }} [metadata]
   *
   * @typedef {Object} RecentPostsProps
   * @property {RawPost[]} [recentPosts]
   */

  /** @type {RecentPostsProps} */
  let { recentPosts = [] } = $props()

  // ~ Vue: const rawList = computed(() => Array.isArray(props.recentPosts) ? props.recentPosts : [])
  // Guard first, separately from mapping, so a malformed prop (undefined,
  // an object, a string) can never reach `.map()`.
  const rawList = $derived(Array.isArray(recentPosts) ? recentPosts : [])

  // ~ Vue: function normalizePost(post) { ... } - a pure helper used
  // inside a computed, kept outside any rune since it has no reactive
  // dependencies of its own (same rationale as a plain method in Vue).
  /**
   * Normalize whatever shape the backend sends (post.metadata.* or flat
   * post.*) into one consistent view-model the template can rely on.
   * @param {RawPost} post
   */
  function normalizePost(post) {
    const meta = post?.metadata || post || {}
    return {
      slug: post?.slug || meta.slug || '',
      title: meta.title || post?.title || 'Không có tiêu đề',
      date: meta.date || null,
      readingTime: meta.readingTime || null
    }
  }

  // ~ Vue: const safePosts = computed(() => rawList.value.map(normalizePost))
  const safePosts = $derived(rawList.map(normalizePost))

  // ~ Vue: const hasPosts = computed(() => safePosts.value.length > 0)
  const hasPosts = $derived(safePosts.length > 0)
</script>

{#if hasPosts}
  <!-- wp-block-query wrapper analogue: flat list, no card chrome -->
  <div class="recent-posts">
    <ul class="recent-posts__list wp-block-post-template">
      {#each safePosts as post (post.slug || post.title)}
        <li class="recent-posts__item wp-block-post">
          <a
            href="/blog/{post.slug}"
            data-sveltekit-preload-data="hover"
            class="recent-posts__link wp-block-post-title"
          >
            {post.title}
          </a>
          {#if post.date || post.readingTime}
            <div class="recent-posts__meta wp-block-post-date has-small-font-size">
              {#if post.date}
                <time class="post-date" datetime={post.date}>
                  {toDisplayDate(post.date)}
                </time>
              {/if}
              {#if post.readingTime}
                <span class="recent-posts__reading-time">· {post.readingTime} phút đọc</span>
              {/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>

    <a href="/blog" data-sveltekit-preload-data="hover" class="recent-posts__view-all">
      Xem tất cả bài viết →
    </a>
  </div>
{:else}
  <div class="recent-posts recent-posts--empty">
    <p class="recent-posts__empty-text has-small-font-size">Chưa có bài viết nào được tìm thấy.</p>
    <a href="/blog" data-sveltekit-preload-data="hover" class="recent-posts__view-all">
      Khám phá trang Blog →
    </a>
  </div>
{/if}

<style>
  /*
   * WordPress Twenty Twenty-Five design tokens, hand-mirrored:
   * - Type pairing: Manrope (body/headings) + Fira Code (meta/mono),
   *   T25's default font pairing (theme.json).
   * - Link underline: 1px thickness, .1em offset - same values T25's
   *   style.css hardcodes for content links (not nav links).
   * - Focus ring: 2px solid outline, no offset trickery - T25 keeps
   *   focus styles plain and highly visible for accessibility.
   * - No card borders/shadows/rounded corners: T25 leans on whitespace
   *   and type contrast rather than boxed "cards" for list content.
   */
  .recent-posts {
    font-family: 'Manrope', system-ui, sans-serif;
  }

  .recent-posts__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .recent-posts__item {
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--wp--preset--color--contrast-3, #ddd);
  }
  .recent-posts__item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  :global(.dark) .recent-posts__item {
    border-bottom-color: #374151;
  }

  .recent-posts__link {
    display: block;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.4;
    color: #111827;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.1em;
  }
  :global(.dark) .recent-posts__link {
    color: #f9fafb;
  }
  .recent-posts__link:hover,
  .recent-posts__link:focus {
    color: #0284c7;
  }
  :global(.dark) .recent-posts__link:hover,
  :global(.dark) .recent-posts__link:focus {
    color: #38bdf8;
  }
  .recent-posts__link:focus-visible {
    outline: 2px solid #0284c7;
    outline-offset: 2px;
  }

  .recent-posts__meta {
    margin-top: 0.35rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: 'Fira Mono', ui-monospace, monospace;
    font-size: 0.85rem;
    color: #4b5563;
  }
  :global(.dark) .recent-posts__meta {
    color: #d1d5db;
  }

  .recent-posts__view-all {
    display: inline-block;
    margin-top: 1.5rem;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 0.02em;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.15em;
    color: #0369a1;
  }
  :global(.dark) .recent-posts__view-all {
    color: #38bdf8;
  }

  .recent-posts--empty {
    padding: 1.5rem 0;
    text-align: center;
  }
  .recent-posts__empty-text {
    font-style: italic;
    color: #4b5563;
    margin: 0 0 0.5rem;
  }
  :global(.dark) .recent-posts__empty-text {
    color: #d1d5db;
  }
</style>
