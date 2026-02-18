import{redirect as p}from"@sveltejs/kit";import{a as g,O as u}from"../../../../../../chunks/private.js";const b=async({url:t,cookies:i})=>{const a=t.searchParams.get("code"),n=t.searchParams.get("state"),r=t.searchParams.get("error"),h=t.searchParams.get("error_description"),s=i.get("oauth_state");if(i.delete("oauth_state",{path:"/"}),(!n||!s||n!==s)&&(console.error("OAuth state mismatch",{state:n,storedState:s}),p(302,"/?error=state_mismatch")),r)return console.error("GitHub OAuth Error:",r,h),new Response(`
      <script>
        if (window.opener) {
          window.opener.postMessage(
            'authorization:github:error:${encodeURIComponent(r)}',
            window.location.origin
          );
          window.close();
        } else {
          window.location.href = '/?error=${encodeURIComponent(r)}';
        }
      <\/script>
      `,{headers:{"Content-Type":"text/html"}});a||(console.error("Missing authorization code"),p(302,"/?error=missing_code"));const d={code:a,client_id:u,client_secret:g};try{const e=await fetch("https://github.com/login/oauth/access_token",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(d)});if(!e.ok){const w=await e.text();throw console.error(`GitHub OAuth Fetch Error: Status ${e.status}`,w),new Error(`HTTP error! status: ${e.status}`)}const o=await e.json();if(o.error)throw new Error(`GitHub OAuth Error: ${o.error_description||o.error}`);if(!o.access_token)throw new Error("No access token received from GitHub");const c={token:o.access_token,provider:"github"},l=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Callback</title>
      </head>
      <body>
        <p>Đang xác thực...</p>
        <script>
          (function() {
            const content = ${JSON.stringify(c).replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/"/g,'\\"')};
            const provider = '${c.provider}';
            
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
        <\/script>
      </body>
      </html>
    `;return new Response(l,{headers:{"Content-Type":"text/html","Cache-Control":"no-store, no-cache, must-revalidate",Pragma:"no-cache"}})}catch(e){console.error("OAuth callback error:",e);const o=e instanceof Error?e.message:"Unknown error";return new Response(`
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
              'authorization:github:error:${encodeURIComponent(o)}',
              window.location.origin
            );
            setTimeout(function() { window.close(); }, 1000);
          } else {
            setTimeout(function() {
              window.location.href = '/?error=auth_failed';
            }, 2000);
          }
        <\/script>
      </body>
      </html>
      `,{headers:{"Content-Type":"text/html","Cache-Control":"no-store"}})}};export{b as GET};
