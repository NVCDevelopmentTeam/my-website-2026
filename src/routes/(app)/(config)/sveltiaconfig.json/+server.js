import { json } from '@sveltejs/kit'
import { siteConfig } from '$lib/config'
export const prerender = true

/**
 * Sveltia CMS configuration with WordPress-like slug behavior
 *
 * Principles:
 * - English only (avoid CMS UI issues)
 * - Auto-generate slug from title (can be customized)
 * - CMS = editor only, NOT data authority
 *
 * Slug logic:
 * - Auto-generated from title when creating new post
 * - User can edit/override slug manually
 * - File name follows slug pattern
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
    // Production backend (GitHub via Netlify)
    backend: {
      name: 'github',
      repo: 'NVCDevelopmentTeam/my-website-2026',
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
        slug: '{{slug}}', // File name will follow slug
        fields: [
          {
            label: 'Title',
            name: 'title',
            widget: 'string'
          },
          {
            label: 'Slug',
            name: 'slug',
            widget: 'string',
            required: false,
            hint: 'Auto-generated from title. Edit to customize URL-friendly name (e.g., my-awesome-page)'
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
        slug: '{{slug}}', // File name will follow slug
        fields: [
          {
            label: 'Title',
            name: 'title',
            widget: 'string'
          },
          {
            label: 'Slug',
            name: 'slug',
            widget: 'string',
            required: false,
            hint: 'Auto-generated from title. Edit to customize URL (e.g., bai-viet-cua-toi)'
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
            widget: 'list',
            required: false,
            hint: 'Add categories one by one'
          },
          {
            label: 'Tags',
            name: 'tags',
            widget: 'list',
            required: false,
            hint: 'Add tags one by one'
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
