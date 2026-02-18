import{g as h}from"../../../../../chunks/pages.js";import{g as y,a as f,b as $}from"../../../../../chunks/posts.js";import{s as r}from"../../../../../chunks/config.js";const x=!0,U="never";async function S({setHeaders:a}){a({"Cache-Control":"max-age=0, s-maxage=3600","Content-Type":"application/xml; charset=utf-8"});try{const{pages:e=[]}=await h({limit:-1})||{},{posts:o=[]}=await y({limit:-1})||{},l=await f()||[],i=await $()||[],s=`
  <url>
    <loc>${r.siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,n=e.map(t=>`
  <url>
    <loc>${r.siteUrl}/${t.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>${t.priority||.7}</priority>
  </url>`).join(""),c=o.map(t=>{const u=t.metadata?.date?new Date(t.metadata.date).toISOString():new Date().toISOString();return`
  <url>
    <loc>${r.siteUrl}/blog/${t.slug}</loc>
    <lastmod>${u}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`}).join(""),g=l.map(t=>`
  <url>
    <loc>${r.siteUrl}/blog/category/${t.metadata.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join(""),m=i.map(t=>`
  <url>
    <loc>${r.siteUrl}/blog/tag/${t.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.4</priority>
  </url>`).join(""),p=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${s}${n}${c}${g}${m}
</urlset>`;return new Response(p.trim())}catch(e){console.error("Sitemap generation error:",e);const o=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${r.siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;return new Response(o.trim())}}export{S as GET,x as prerender,U as trailingSlash};
