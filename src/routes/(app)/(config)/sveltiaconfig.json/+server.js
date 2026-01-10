import { json } from '@sveltejs/kit'
import { siteConfig } from '$lib/config'

/**
 * Sveltia CMS configuration (minimal & stable)
 *
 * Principles:
 * - English only (avoid CMS UI issues)
 * - No slug generation
 * - No preview / auto description
 * - CMS = editor only, NOT data authority
 *
 * Author logic:
 * - Default author comes from siteConfig
 * - User MAY override author in markdown
 * - Frontend decides final author (markdown > siteConfig)
 *
 * Categories & tags:
 * - Comma-separated string
 * - Stored as plain text in markdown
 * - Frontend parses & handles logic
 */
export async function GET() {
  const defaultAuthor = siteConfig?.author?.name || ''

  const config = {
    // Local development backend
    local_backend: true,

    // Production backend (GitHub via Netlify)
    backend: {
      name: 'github',
      repo: 'NVCDevelopmentTeam/my-website-2',
      branch: 'main',
      site_domain: siteConfig.siteDomain,
      base_url: siteConfig.siteUrl,
      auth_endpoint: '/oauth'
    },

    // Media storage
    media_folder: 'src/lib/assets',
    public_folder: '/src/lib/assets',

    // Collections
    collections: [
      {
        name: 'pages',
        label: 'Pages',
        folder: 'src/lib/contents/pages',
        create: true,
        fields: [
          {
            label: 'Title',
            name: 'title',
            widget: 'string'
          },
          {
            label: 'Content',
            name: 'body',
            widget: 'markdown'
          }
        ]
      },
      {
        name: 'blog_posts',
        label: 'Posts',
        folder: 'src/lib/contents/posts',
        create: true,
        fields: [
          {
            label: 'Title',
            name: 'title',
            widget: 'string'
          },
          {
            label: 'Publish Date',
            name: 'date',
            widget: 'datetime'
          },
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
            hint: 'Separate values with commas (,)'
          },
          {
            label: 'Tags',
            name: 'tags',
            widget: 'string',
            required: false,
            hint: 'Separate values with commas (,)'
          },
          {
            label: 'Content',
            name: 'body',
            widget: 'markdown'
          }
        ]
      }
    ]
  }

  return json(config)
}
