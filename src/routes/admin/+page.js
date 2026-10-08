import { siteConfig } from '#lib/config.js'

export const ssr = false
export const prerender = true

/**
 * Sveltia CMS configuration.
 *
 * Authentication: the site is hosted on Netlify, which provides the GitHub OAuth
 * flow itself. With `name: 'github'` and NO `base_url`, Sveltia CMS uses
 * https://api.netlify.com as the OAuth broker, so nothing runs on our side.
 * One-time setup in the Netlify dashboard: Site configuration → Access & security →
 * OAuth → Install provider → GitHub (OAuth App callback: https://api.netlify.com/auth/done).
 *
 * The collections list the frontmatter fields the site reads (lib/data/posts.js,
 * lib/data/pages.js, PageContent.svelte). Anything left empty here is handled by the
 * frontend: slugs are normalised, description/preview/readingTime are generated from
 * the content (mdsvex.config.js), a missing menu simply means "not in any menu".
 */
export const load = async () => {
  const defaultAuthor = siteConfig?.author?.name || ''

  const config = {
    load_config_file: false,
    backend: {
      name: 'github',
      repo: siteConfig?.backend?.repo || '',
      branch: siteConfig?.backend?.branch || 'main'
    },
    media_folder: 'src/lib/assets',
    public_folder: '/src/lib/assets',
    collections: [
      {
        name: 'pages',
        label: 'Pages',
        folder: 'src/lib/contents/pages',
        create: true,
        slug: '{{slug}}',
        fields: [
          { label: 'Title', name: 'title', widget: 'string' },
          { label: 'Slug', name: 'slug', widget: 'string', required: false },
          { label: 'Description', name: 'description', widget: 'text', required: false },
          {
            label: 'Menu',
            name: 'menu',
            widget: 'select',
            options: [
              { label: 'Navigation', value: 'nav' },
              { label: 'Footer', value: 'footer' }
            ],
            required: false
          },
          {
            label: 'FAQs',
            name: 'faqs',
            widget: 'list',
            required: false,
            fields: [
              { label: 'Question', name: 'question', widget: 'string' },
              { label: 'Answer', name: 'answer', widget: 'text' }
            ]
          },
          { label: 'Content', name: 'body', widget: 'markdown' }
        ]
      },
      {
        name: 'blog_posts',
        label: 'Posts',
        folder: 'src/lib/contents/posts',
        create: true,
        slug: '{{slug}}',
        fields: [
          { label: 'Title', name: 'title', widget: 'string' },
          { label: 'Slug', name: 'slug', widget: 'string', required: false },
          { label: 'Publish Date', name: 'date', widget: 'datetime' },
          {
            label: 'Author',
            name: 'author',
            widget: 'string',
            required: false,
            default: defaultAuthor
          },
          { label: 'Categories', name: 'categories', widget: 'string', required: false },
          { label: 'Tags', name: 'tags', widget: 'string', required: false },
          { label: 'Description', name: 'description', widget: 'text', required: false },
          { label: 'Draft', name: 'draft', widget: 'boolean', required: false, default: false },
          { label: 'Content', name: 'body', widget: 'markdown' }
        ]
      }
    ]
  }

  return { config }
}
