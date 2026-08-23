import { json } from '@sveltejs/kit';
import { siteConfig } from '$lib/config';

export const prerender = true;
export const trailingSlash = 'never';

/**
 * Sveltia CMS configuration with WordPress-like slug behavior.
 *
 * Principles:
 * - English configuration layout to prevent CMS UI compatibility issues.
 * - Auto-generate slug from title with manual customization support.
 * - CMS functions strictly as an editor, not the primary data authority.
 *
 * Slug logic:
 * - Automatically extracted from the title during creation.
 * - Users can manually overwrite or fine-tune the slug.
 * - The markdown file name strictly adheres to the finalized slug pattern.
 *
 * Author logic:
 * - Fallback author is dynamically retrieved from siteConfig.
 * - Content managers can override the author per post in frontmatter.
 * - Frontend application resolves priority (Frontmatter > siteConfig).
 *
 * Categories & tags:
 * - Maintained as comma-separated values (CSV) string format.
 * - Raw string data is stored directly inside the markdown file.
 * - UI/Frontend handles parsing, sorting, and tag-cloud logic.
 */
export async function GET() {
  // Dynamically resolve default author with an ultimate fallback string
  const defaultAuthor = siteConfig?.author?.name || '';

  const config = {
    // Sveltia CMS repository integration mapping directly from siteConfig
    backend: {
      name: siteConfig?.backend?.name || 'github',
      repo: siteConfig?.backend?.repo || '',
      branch: siteConfig?.backend?.branch || 'main',
      site_domain: siteConfig?.siteDomain || '',
      // Non-Cloudflare Appwrite custom endpoint setup for OAuth validation
      base_url: siteConfig?.siteUrl || '',
      auth_endpoint: '/auth' // Points to the Appwrite function path configured previously
    },

    // Media and static asset storage folders
    media_folder: 'src/lib/assets',
    public_folder: '/src/lib/assets',

    // Content collections schemas
    collections: [
      {
        name: 'pages',
        label: 'Pages',
        folder: 'src/lib/contents/pages',
        create: true,
        slug: '{{slug}}', // Markdown filename matches the resolved URL slug
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
        slug: '{{slug}}', // Markdown filename matches the resolved URL slug
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
          {
            label: 'Content',
            name: 'body',
            widget: 'markdown'
          }
        ]
      }
    ]
  };

  return json(config);
}
