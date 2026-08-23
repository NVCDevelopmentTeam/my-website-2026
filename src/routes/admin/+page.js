import { siteConfig } from '$lib/config'

export const ssr = false
export const prerender = true

/**
 * Loads and aggregates the localized Sveltia CMS configuration object.
 * Bypasses remote runtime fetching to avoid 404 and routing state context collision errors.
 *
 * @returns {Promise<{ config: Object }>} The computed immutable configuration state.
 */
export const load = async () => {
  try {
    const defaultAuthor = siteConfig?.author?.name || ''

    // Standardized fully qualified configuration object
    const config = {
      // Direct core instruction to force Sveltia CMS to completely bypass loading the config.yml file
      load_config_file: false,

      // Satisfies internal engine schema checking expectations directly
      $schema: 'https://unpkg.com',

      // Backend integration state mapping
      backend: {
        name: siteConfig?.backend?.name || 'github',
        repo: siteConfig?.backend?.repo || '',
        branch: siteConfig?.backend?.branch || 'main',
        site_domain: siteConfig?.siteDomain || '',
        base_url: siteConfig?.siteUrl || '',
        auth_endpoint: '/auth'
      },

      // Directory bindings for static storage
      media_folder: 'src/lib/assets',
      public_folder: '/src/lib/assets',

      // Structure definitions for document groups
      collections: [
        {
          name: 'pages',
          label: 'Pages',
          folder: 'src/lib/contents/pages',
          create: true,
          slug: '{{slug}}',
          fields: [
            { label: 'Title', name: 'title', widget: 'string' },
            {
              label: 'Slug',
              name: 'slug',
              widget: 'string',
              required: false,
              hint: 'Auto-generated from title. Edit to customize URL-friendly name (e.g., my-awesome-page)'
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
            {
              label: 'Slug',
              name: 'slug',
              widget: 'string',
              required: false,
              hint: 'Auto-generated from title. Edit to customize URL (e.g., bai-viet-cua-toi)'
            },
            { label: 'Publish Date', name: 'date', widget: 'datetime' },
            {
              label: 'Author',
              name: 'author',
              widget: 'string',
              required: false,
              default: defaultAuthor,
              hint: 'Leave empty to use site default author'
            },
            {
              label: 'Categories',
              name: 'categories',
              widget: 'string',
              required: false,
              hint: 'Enter categories separated by commas (e.g., Tech, News)'
            },
            {
              label: 'Tags',
              name: 'tags',
              widget: 'string',
              required: false,
              hint: 'Enter tags separated by commas (e.g., svelte, tailwind)'
            },
            { label: 'Content', name: 'body', widget: 'markdown' }
          ]
        }
      ]
    }

    return { config }
  } catch (err) {
    console.error('Core configuration processing failed:', err)
    return { config: null, error: err.message }
  }
}
