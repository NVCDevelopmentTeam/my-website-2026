import { siteConfig } from '$lib/config'
import { Client, Account } from 'appwrite'

export const ssr = false
export const prerender = true

/**
 * Single entrypoint for this route. It serves three purposes:
 *
 *  1. Normal load (no query params) -> returns the Sveltia CMS config.
 *  2. OAuth popup target: Sveltia's GitHub backend opens a popup at
 *     `${backend.base_url}/${backend.auth_endpoint}`, which resolves back
 *     to THIS same route (see `config.backend` below) -> the +page.svelte
 *     then kicks off the Appwrite OAuth2 redirect from inside that popup.
 *  3. OAuth callback: Appwrite redirects the popup back here with
 *     `?userId=...&secret=...` (the token-based OAuth2 flow) -> we
 *     exchange that token for a real Appwrite session and read the
 *     GitHub access token off the resulting identity.
 */
export const load = async ({ url }) => {
  const provider = url.searchParams.get('provider') || 'github'
  const userId = url.searchParams.get('userId')
  const secret = url.searchParams.get('secret')

  if (userId && secret) {
    try {
      const client = new Client()
        .setEndpoint(siteConfig.appwrite.endpoint)
        .setProject(siteConfig.appwrite.projectId)

      const account = new Account(client)

      // Token-based OAuth2 exchange: creates the session on OUR domain
      // instead of relying on a cookie set on cloud.appwrite.io. This
      // avoids the "providerAccessToken is empty" failures that
      // createOAuth2Session + getSession('current') hits once browsers
      // block third-party cookies.
      await account.createSession({ userId, secret })

      // With the token flow, provider details (incl. the GitHub access
      // token) live on the identity record, not on the session object.
      const { identities } = await account.listIdentities()
      const identity = identities.find((entry) => entry.provider === provider)
      const gitAccessToken = identity?.providerAccessToken || ''

      if (!gitAccessToken) {
        return {
          oauthError: `Đăng nhập Appwrite thành công nhưng không nhận được access token từ ${provider}. Hãy kiểm tra lại scope OAuth (repo, user) đã cấu hình trong Appwrite Console > Auth > OAuth2 Providers.`
        }
      }

      return { oauthSuccess: true, token: gitAccessToken, provider }
    } catch (err) {
      console.error('Appwrite OAuth token exchange failed:', err)
      return {
        oauthError: err?.message || 'Không thể xác thực phiên đăng nhập Appwrite.'
      }
    }
  }

  // Fallback to standard CMS config payload output for a normal page load.
  const defaultAuthor = siteConfig?.author?.name || ''
  const authPath = url.pathname.replace(/^\//, '') // strip leading slash, no trailing dupes

  const config = {
    load_config_file: false,
    $schema: 'https://unpkg.com',
    backend: {
      name: 'github',
      repo: siteConfig?.backend?.repo || '',
      branch: siteConfig?.backend?.branch || 'main',
      // Points Sveltia's built-in popup-based OAuth flow back at THIS
      // route (origin + this same pathname), which is what actually
      // talks to Appwrite (see triggerAppwriteOAuth() in +page.svelte).
      base_url: url.origin,
      auth_endpoint: authPath
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
          {
            label: 'Author',
            name: 'author',
            widget: 'string',
            required: false,
            default: defaultAuthor
          },
          { label: 'Categories', name: 'categories', widget: 'string', required: false },
          { label: 'Tags', name: 'tags', widget: 'string', required: false },
          { label: 'Content', name: 'body', widget: 'markdown' }
        ]
      }
    ]
  }

  return { config }
}
