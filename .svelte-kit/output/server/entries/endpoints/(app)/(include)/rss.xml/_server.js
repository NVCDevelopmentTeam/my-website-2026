import{g as u}from"../../../../../chunks/posts.js";import{s as t}from"../../../../../chunks/config.js";const x=!0,U="never";async function f({setHeaders:a}){a({"Cache-Control":"max-age=0, s-maxage=3600","Content-Type":"application/xml; charset=utf-8"});try{const{posts:n=[]}=await u({limit:-1})||{},i=n.map(e=>{const l=`${t.siteUrl}/blog/${e.slug}`,s=e.metadata?.date?new Date(e.metadata.date).toUTCString():new Date().toUTCString(),c=r(e.metadata?.title||"Untitled"),m=r(e.metadata?.description||e.metadata?.excerpt||"No description available"),g=r(e.metadata?.author||t.author?.name||t.title),p=Array.isArray(e.metadata?.categories)?e.metadata.categories.map(d=>`<category>${r(d)}</category>`).join(`
      `):"";return`
    <item>
      <guid isPermaLink="true">${l}</guid>
      <title>${c}</title>
      <link>${l}</link>
      <description>${m}</description>
      <pubDate>${s}</pubDate>
      <author>${g}</author>
      ${p}
    </item>`}).join(""),o=`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${r(t.title)}</title>
    <link>${t.siteUrl}</link>
    <description>${r(t.description)}</description>
    <language>${t.language||"vi"}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${t.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${i}
  </channel>
</rss>`;return new Response(o.trim())}catch(n){console.error("RSS generation error:",n);const i=`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${r(t.title)}</title>
    <link>${t.siteUrl}</link>
    <description>${r(t.description)}</description>
  </channel>
</rss>`;return new Response(i.trim())}}function r(a){return a?String(a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;"):""}export{f as GET,x as prerender,U as trailingSlash};
