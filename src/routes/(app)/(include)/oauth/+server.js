import { error, redirect } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

export const prerender = false

export const GET = async ({ cookies }) => {
  const clientId = env.OAUTH_GITHUB_CLIENT_ID
  if (!clientId) {
    error(500, 'OAuth is not configured.')
  }

  const state = crypto.randomUUID()

  cookies.set('oauth_state', state, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 600
  })

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'repo,user',
    state
  })

  redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`)
}
