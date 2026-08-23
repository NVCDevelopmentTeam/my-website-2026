import { siteConfig } from '$lib/config'
import { Client, Account } from 'appwrite'

export const ssr = false
export const prerender = true

/**
 * Single entrypoint for loading Sveltia CMS configuration and catching Appwrite OAuth callbacks.
 */
export const load = async ({ url }) => {
  const provider = url.searchParams.get('provider') || 'github';
  const hasAppwriteAuthSession = url.searchParams.get('secret') && url.searchParams.get('userId');

  if (hasAppwriteAuthSession) {
    try {
      // Initialize Appwrite client link pointing directly to the global secure cloud region
      const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1') // MUST match the .svelte file endpoint to resolve 401 bugs
        .setProject('698965f2000da6808b70');

      const account = new Account(client);
      
      // Fetch the active session to resolve the underlying Git Token
      const session = await account.getSession('current');
      const gitAccessToken = session?.providerAccessToken || '';

      if (gitAccessToken) {
        return {
          oauthSuccess: true,
          token: gitAccessToken,
          provider
        };
      }
    } catch (err) {
      console.error('OAuth token extraction failed:', err);
      return { oauthError: 'Could not extract Git credentials from Appwrite session.' };
    }
  }

  // Fallback to standard CMS config payload output if it's just a normal page load
  const defaultAuthor = siteConfig?.author?.name || '';
  const config = {
    load_config_file: false,
    $schema: 'https://unpkg.com',
    backend: {
      name: 'github',
      repo: siteConfig?.backend?.repo || '',
      branch: siteConfig?.backend?.branch || 'main',
      site_domain: siteConfig?.siteDomain || '',
      base_url: 'https://cloud.appwrite.io', // Standardize backend gateway base location
      auth_endpoint: url.pathname 
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
          { label: 'Author', name: 'author', widget: 'string', required: false, default: defaultAuthor },
          { label: 'Categories', name: 'categories', widget: 'string', required: false },
          { label: 'Tags', name: 'tags', widget: 'string', required: false },
          { label: 'Content', name: 'body', widget: 'markdown' }
        ]
      }
    ]
  };

  return { config };
}
