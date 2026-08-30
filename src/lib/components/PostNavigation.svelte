<script>
  import { siteConfig } from '$lib/config'

  /**
   * PostNavigation — mirrors WordPress Twenty Twenty-Five's block-theme
   * equivalent of `get_the_post_navigation()`: a `<nav>` landmark built
   * from the "Query Pagination" pattern (`wp-block-query-pagination`,
   * `wp-block-query-pagination-previous` / `-next`), not the classic-theme
   * `.navigation.post-navigation` box. T25 renders these as plain text
   * links with a small arrow glyph and generous spacing - no bordered
   * card, no background fill - so the markup/CSS below follows that:
   * flat links, not boxed buttons. A screen-reader-only heading and
   * `aria-label` are kept because T25's accessibility baseline still
   * requires a labeled landmark even though the visual chrome is gone.
   *
   * -- Svelte 5 runes <-> Vue 3 Composition API -------------------------
   * Same split-per-concern approach as in RecentPosts.svelte:
   *
   *   Svelte 5                        Vue 3 (script setup)
   *   -------------------------------  -------------------------------
   *   let { post, prevPost } = $props() defineProps<{ post, prevPost }>()
   *   $derived(expr)                    computed(() => expr)
   *   function f(x) { ... }             function f(x) { ... } (plain method)
   *
   * `newerPost` / `olderPost` / `hasNewerPost` / `hasOlderPost` are pure,
   * memoized derivations with no side effects, exactly like Vue computed
   * refs - they only ever read props, never write them.
   *
   * @typedef {Object} NavPost
   * @property {string} [slug]
   * @property {string} [title]
   * @property {{ title?: string }} [metadata]
   *
   * @typedef {Object} PostNavigationProps
   * @property {{ prevPost?: NavPost, nextPost?: NavPost, metadata?: { prevPost?: NavPost, nextPost?: NavPost } }} [post]
   * @property {NavPost} [prevPost]
   * @property {NavPost} [nextPost]
   */

  /** @type {PostNavigationProps} */
  let {
    post = undefined,
    prevPost: propPrevPost = undefined,
    nextPost: propNextPost = undefined
  } = $props()

  // ~ Vue: const blogBasePath = computed(() => siteConfig?.blog?.basePath || '/blog')
  // Static per render, but kept as a plain const (not a rune) since
  // `siteConfig` isn't reactive state - same as reading an imported
  // constant directly in a Vue <script setup> block.
  const blogBasePath = siteConfig?.blog?.basePath || '/blog'

  const labels = {
    navigation: 'Điều hướng bài viết',
    previous: 'Bài trước',
    next: 'Bài sau',
    allPosts: 'Tất cả bài viết',
    firstPost: 'Đang ở bài đầu tiên',
    latestPost: 'Đang ở bài mới nhất'
  }

  // Posts are ordered newest-to-oldest in the backend list.
  // - propPrevPost / post.prevPost is the item BEFORE the current one in
  //   that list, i.e. the NEWER article -> rendered as the "Next" link
  //   (rel="next"), matching WP's "next = newer" convention.
  // - propNextPost / post.nextPost is the item AFTER the current one in
  //   that list, i.e. the OLDER article -> rendered as the "Previous" link
  //   (rel="prev"), matching WP's "previous = older" convention.
  // ~ Vue: const newerPost = computed(() => propPrevPost ?? post.value?.prevPost ?? post.value?.metadata?.prevPost ?? null)
  const newerPost = $derived(propPrevPost || post?.prevPost || post?.metadata?.prevPost || null)
  // ~ Vue: const olderPost = computed(() => propNextPost ?? post.value?.nextPost ?? post.value?.metadata?.nextPost ?? null)
  const olderPost = $derived(propNextPost || post?.nextPost || post?.metadata?.nextPost || null)

  // ~ Vue: const hasNewerPost = computed(() => Boolean(newerPost.value && (newerPost.value.slug || newerPost.value.title)))
  const hasNewerPost = $derived(Boolean(newerPost && (newerPost.slug || newerPost.title)))
  // ~ Vue: const hasOlderPost = computed(() => Boolean(olderPost.value && (olderPost.value.slug || olderPost.value.title)))
  const hasOlderPost = $derived(Boolean(olderPost && (olderPost.slug || olderPost.title)))

  /**
   * Build a link for an adjacent post, falling back to the blog index
   * when no slug is available. Equivalent to a small Vue "method" - a
   * pure function with no reactive dependencies, so it doesn't need to
   * be a rune.
   * @param {string | undefined} slug
   * @returns {string}
   */
  function getPostUrl(slug) {
    if (!slug) return blogBasePath
    return slug.startsWith('/') ? slug : `${blogBasePath}/${slug}`
  }

  /**
   * @param {NavPost | null} targetPost
   * @returns {string}
   */
  function getPostTitle(targetPost) {
    return targetPost?.metadata?.title || targetPost?.title || 'Không có tiêu đề'
  }
</script>

<!-- Post Navigation - T25's "Query Pagination" pattern: flat text links,
     no card/box chrome, small arrow glyphs instead of icon buttons. -->
<nav class="post-navigation wp-block-query-pagination" aria-label={labels.navigation}>
  <h2 class="sr-only">{labels.navigation}</h2>

  <div class="post-navigation__links">
    <!-- Previous Post (older article, rel="prev") -->
    <div class="post-navigation__prev wp-block-query-pagination-previous">
      {#if hasOlderPost}
        <a href={getPostUrl(olderPost.slug)} data-sveltekit-preload-data="hover" rel="prev">
          <span class="post-navigation__arrow" aria-hidden="true">←</span>
          <span class="post-navigation__group">
            <span class="post-navigation__label">{labels.previous}</span>
            <span class="post-navigation__title">{getPostTitle(olderPost)}</span>
          </span>
        </a>
      {:else}
        <span class="post-navigation__placeholder">
          <span class="post-navigation__label">← {labels.previous}</span>
          <span class="post-navigation__title post-navigation__title--muted"
            >{labels.firstPost}</span
          >
        </span>
      {/if}
    </div>

    <!-- Center: link back to the archive/blog index -->
    <div class="post-navigation__all">
      <a
        href={blogBasePath}
        data-sveltekit-preload-data="hover"
        title="Quay về danh sách tất cả bài viết"
      >
        {labels.allPosts}
      </a>
    </div>

    <!-- Next Post (newer article, rel="next") -->
    <div class="post-navigation__next wp-block-query-pagination-next">
      {#if hasNewerPost}
        <a href={getPostUrl(newerPost.slug)} data-sveltekit-preload-data="hover" rel="next">
          <span class="post-navigation__group">
            <span class="post-navigation__label">{labels.next}</span>
            <span class="post-navigation__title">{getPostTitle(newerPost)}</span>
          </span>
          <span class="post-navigation__arrow" aria-hidden="true">→</span>
        </a>
      {:else}
        <span class="post-navigation__placeholder post-navigation__placeholder--right">
          <span class="post-navigation__label">{labels.next} →</span>
          <span class="post-navigation__title post-navigation__title--muted"
            >{labels.latestPost}</span
          >
        </span>
      {/if}
    </div>
  </div>
</nav>

<style>
  /*
   * WordPress Twenty Twenty-Five design tokens, hand-mirrored - same
   * baseline as RecentPosts.svelte:
   * - System sans-serif for links/labels, Fira Mono for the small
   *   uppercase meta label (see --font-sans/--font-mono in app.css).
   * - Content links underlined at 1px / .1em offset, exactly as T25's
   *   style.css hardcodes.
   * - Plain 2px solid focus outline, no fancy offset.
   * - No border/shadow/rounded "card" - T25's Query Pagination pattern
   *   is just spaced-out text with a top border to separate it from the
   *   post content above.
   */

  .post-navigation {
    font-family: var(--font-sans);
    margin-block: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }
  :global(.dark) .post-navigation {
    border-top-color: #374151;
  }

  .post-navigation__links {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  @media (min-width: 768px) {
    .post-navigation__links {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: start;
      gap: 1.5rem;
    }
  }

  .post-navigation__prev a,
  .post-navigation__next a {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    text-decoration: none;
    color: #111827;
  }
  :global(.dark) .post-navigation__prev a,
  :global(.dark) .post-navigation__next a {
    color: #f9fafb;
  }
  .post-navigation__next a {
    justify-content: flex-end;
    text-align: right;
  }
  .post-navigation__prev a:hover .post-navigation__title,
  .post-navigation__next a:hover .post-navigation__title {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.1em;
    color: #0284c7;
  }
  :global(.dark) .post-navigation__prev a:hover .post-navigation__title,
  :global(.dark) .post-navigation__next a:hover .post-navigation__title {
    color: #38bdf8;
  }
  .post-navigation__prev a:focus-visible,
  .post-navigation__next a:focus-visible,
  .post-navigation__all a:focus-visible {
    outline: 2px solid #0284c7;
    outline-offset: 2px;
  }

  .post-navigation__arrow {
    font-size: 1.1rem;
    line-height: 1.4;
    color: #4b5563;
  }
  :global(.dark) .post-navigation__arrow {
    color: #d1d5db;
  }

  .post-navigation__group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .post-navigation__label {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #4b5563;
  }
  :global(.dark) .post-navigation__label {
    color: #d1d5db;
  }

  .post-navigation__title {
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .post-navigation__title--muted {
    font-weight: 400;
    font-style: italic;
    color: #6b7280;
  }
  :global(.dark) .post-navigation__title--muted {
    color: #9ca3af;
  }

  .post-navigation__placeholder {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    opacity: 0.75;
  }
  .post-navigation__placeholder--right {
    align-items: flex-end;
    text-align: right;
  }

  .post-navigation__all {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .post-navigation__all a {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.15em;
    color: #0369a1;
    white-space: nowrap;
  }
  :global(.dark) .post-navigation__all a {
    color: #38bdf8;
  }
</style>
