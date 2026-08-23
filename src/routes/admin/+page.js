import { siteConfig } from '$lib/config'
import { Client, Account } from 'appwrite'

export const ssr = false
export const prerender = true

/**
 * Combined entrypoint for checking active Appwrite OAuth redirect params
 * and serving the synchronized Sveltia CMS static configuration object.
 */
export const load = async ({ url }) => {
  const provider = url.searchParams.get('provider') || 'github';
  // Detect if current route hit is a post-authorization redirect from Appwrite Cloud
  const hasAppwriteAuthSession = url.searchParams.get('secret') && url.searchParams.get('userId');

  if (hasAppwriteAuthSession) {
    try {
      const client = new Client()
        .setEndpoint('https://appwrite.io') // Your specific SGP cloud cluster location
        .setProject('698965f2000da6808b70');

      const account = new Account(client);
      
      // Request active session parameters to resolve the underlying Git provider token
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
      console.error('Failed to isolate providerAccessToken during inline load intercept:', err);
      return { oauthError: 'Could not extract Git credentials from Appwrite session status.' };
    }
  }

  // Baseline immutable config layout configuration payload
  const defaultAuthor = siteConfig?.author?.name || '';
  const config = {
    load_config_file: false,
    $schema: 'https://unpkg.com',
    backend: {
      name: 'github',
      repo: siteConfig?.backend?.repo || '',
      branch: siteConfig?.backend?.branch || 'main',
      site_domain: siteConfig?.siteDomain || '',
      base_url: siteConfig?.siteUrl || '',
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
