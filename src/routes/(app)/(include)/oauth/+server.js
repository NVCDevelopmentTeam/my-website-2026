import { redirect } from '@sveltejs/kit'
import { OAUTH_GITHUB_CLIENT_ID } from '$env/static/private'
import { dev } from '$app/environment'

export const GET = async ({ url, cookies }) => {
  if (!OAUTH_GITHUB_CLIENT_ID) {
    console.error('OAUTH_GITHUB_CLIENT_ID is not configured')
    redirect(302, '/?error=config_missing')
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID()

  // Build the callback URL based on environment
  const protocol = dev ? 'http' : 'https'
  const host = url.host
  const redirectUri = `${protocol}://${host}/api/oauth/callback`

  // Prepare the URLSearchParams with the necessary OAuth details
  const params = new URLSearchParams({
    client_id: OAUTH_GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'repo,user',
    state: state
  })

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

  // Store state in cookie for validation
  cookies.set('oauth_state', state, {
    path: '/',
    secure: !dev,
    httpOnly: true,
    maxAge: 600,
    sameSite: 'lax'
  })

  // Redirect to GitHub's OAuth authorization page
  redirect(302, authUrl)
}
