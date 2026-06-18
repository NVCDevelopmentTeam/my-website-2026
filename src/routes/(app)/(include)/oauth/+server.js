import { redirect } from '@sveltejs/kit'
import { OAUTH_GITHUB_CLIENT_ID } from '$env/static/private'

export const prerender = false

export const GET = async ({ cookies }) => {
  const state = crypto.randomUUID()

  cookies.set('oauth_state', state, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 600
  })

  const params = new URLSearchParams({
    client_id: OAUTH_GITHUB_CLIENT_ID,
    scope: 'repo,user',
    state
  })

  redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`)
}
