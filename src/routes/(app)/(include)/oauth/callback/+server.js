import { redirect } from '@sveltejs/kit'
import { OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET } from '$env/static/private'

export const GET = async ({ url, cookies }) => {
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  const storedState = cookies.get('oauth_state')
  cookies.delete('oauth_state', { path: '/' })

  if (!state || !storedState || state !== storedState) {
    console.error('OAuth state mismatch', { state, storedState })
    redirect(302, '/?error=state_mismatch')
  }

  // Handle GitHub OAuth errors
  if (error) {
    console.error('GitHub OAuth Error:', error, errorDescription)
    return new Response(
      `
      <script>
        if (window.opener) {
          window.opener.postMessage(
            'authorization:github:error:${encodeURIComponent(error)}',
            window.location.origin
          );
          window.close();
        } else {
          window.location.href = '/?error=${encodeURIComponent(error)}';
        }
      </script>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }

  // Validate required parameters
  if (!code) {
    console.error('Missing authorization code')
    redirect(302, '/?error=missing_code')
  }

  if (!OAUTH_GITHUB_CLIENT_ID || !OAUTH_GITHUB_CLIENT_SECRET) {
    console.error('OAuth credentials not configured')
    redirect(302, '/?error=config_missing')
  }

  // Exchange code for access token
  const data = {
    code,
    client_id: OAUTH_GITHUB_CLIENT_ID,
    client_secret: OAUTH_GITHUB_CLIENT_SECRET
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
      const errorText = await response.text()
      console.error(`GitHub OAuth Fetch Error: Status ${response.status}`, errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const body = await response.json()

    if (body.error) {
      throw new Error(`GitHub OAuth Error: ${body.error_description || body.error}`)
    }

    if (!body.access_token) {
      throw new Error('No access token received from GitHub')
    }

    // Prepare response content
    const content = {
      token: body.access_token,
      provider: 'github'
    }

    // Safely serialize content for postMessage
    const contentJson = JSON.stringify(content)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')

    // Return HTML with postMessage script for Sveltia CMS
    const script = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Callback</title>
      </head>
      <body>
        <p>Đang xác thực...</p>
        <script>
          (function() {
            const content = ${contentJson};
            const provider = '${content.provider}';
            
            function postMessageToOpener(message) {
              if (window.opener && !window.opener.closed) {
                // Only post to same origin for security
                window.opener.postMessage(message, window.location.origin);
              }
            }

            // Notify opener that authorization is complete
            postMessageToOpener('authorization:' + provider + ':success:' + JSON.stringify(content));

            // Listen for confirmation before closing
            function receiveMessage(event) {
              // Verify origin matches current origin for security
              if (event.origin !== window.location.origin) {
                return;
              }
              
              if (event.data === 'authorizing:' + provider) {
                window.removeEventListener('message', receiveMessage);
                // Give time for message to be processed
                setTimeout(function() {
                  window.close();
                }, 100);
              }
            }

            window.addEventListener('message', receiveMessage, false);

            // Initial notification to opener
            postMessageToOpener('authorizing:' + provider);

            // Fallback: close window after 5 seconds if no response
            setTimeout(function() {
              window.close();
            }, 5000);
          })();
        </script>
      </body>
      </html>
    `

    return new Response(script, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache'
      }
    })
  } catch (err) {
    console.error('OAuth callback error:', err)

    const errorMessage = err instanceof Error ? err.message : 'Unknown error'

    // Return error page with postMessage
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Error</title>
      </head>
      <body>
        <p>Xác thực thất bại.</p>
        <script>
          if (window.opener) {
            window.opener.postMessage(
              'authorization:github:error:${encodeURIComponent(errorMessage)}',
              window.location.origin
            );
            setTimeout(function() { window.close(); }, 1000);
          } else {
            setTimeout(function() {
              window.location.href = '/?error=auth_failed';
            }, 2000);
          }
        </script>
      </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store'
        }
      }
    )
  }
}
