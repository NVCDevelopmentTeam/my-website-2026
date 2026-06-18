import { error, redirect } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import { siteConfig } from '$lib/config'

export const prerender = false

export const GET = async ({ url, cookies }) => {
  const clientId = env.OAUTH_GITHUB_CLIENT_ID
  const clientSecret = env.OAUTH_GITHUB_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    error(500, 'OAuth is not configured.')
  }

  const code = url.searchParams.get('code')
  const returnedState = url.searchParams.get('state')
  const savedState = cookies.get('oauth_state')

  cookies.delete('oauth_state', { path: '/' })

  if (!code || !returnedState || returnedState !== savedState) {
    error(403, 'OAuth state mismatch — possible CSRF attack.')
  }

  const data = {
    code,
    client_id: clientId,
    client_secret: clientSecret
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const body = await response.json()

    const content = JSON.stringify({
      token: body.access_token,
      provider: 'github'
    })

    const targetOrigin = siteConfig.siteUrl

    const script = `
      <script>
        const receiveMessage = (message) => {
          if (window.opener) {
            window.opener.postMessage(
              'authorization:github:success:${content.replace(/'/g, "\\'")}',
              message.origin
            );

            window.removeEventListener("message", receiveMessage, false);
          }
        }
        window.addEventListener("message", receiveMessage, false);

        if (window.opener) {
          window.opener.postMessage("authorizing:github", "${targetOrigin}");
        }
      </script>
    `

    return new Response(script, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (err) {
    console.error('OAuth callback error:', err)
    redirect(302, '/?error=auth_failed')
  }
}
