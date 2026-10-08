/**
 * Single Central Configuration File for the Entire Website
 * Edit this file to update any metadata, branding, analytics, CMS, social links,
 * navigation defaults, or backend settings across the whole site without touching component code.
 */
export const siteConfig = {
  // Site Identity & Metadata
  title: 'Góc thư giãn',
  shortTitle: 'Góc thư giãn',
  description:
    'Lan tỏa nguồn năng lượng tích cực mỗi ngày qua những chia sẻ về lập trình và cuộc sống',
  siteDomain: 'codingnguyen.netlify.app',
  siteUrl: 'https://codingnguyen.netlify.app',
  language: 'vi',
  locale: 'vi_VN',
  timezone: 'Asia/ha-noi',

  // Author details & Contact
  author: {
    name: 'Coding Nguyễn',
    email: 'contact@codingnguyen.dev',
    url: 'https://codingnguyen.netlify.app',
    // Public Access Key for Web3Forms (https://web3forms.com/)
    // DO NOT expose private or secret keys here as this file is accessible to the client.
    accessKey: ''
  },

  // Sveltia CMS & Git integration backend settings.
  // OAuth is provided by Netlify (Site configuration → Access & security → OAuth → GitHub),
  // so no token broker / base_url is needed. See routes/admin/+page.js.
  backend: {
    name: 'github',
    repo: 'NVCDevelopmentTeam/my-website-2026',
    branch: 'main'
  },

  // Geo metadata for SEO optimization
  geo: {
    region: 'VN-HN',
    placename: 'Ha Noi',
    position: '21.0285;105.8542',
    icbm: '21.0285, 105.8542'
  },

  // Blog routing and core layouts
  blog: {
    basePath: '/blog',
    postsPerPage: 10,
    recentPostsCount: 5
  },

  // UI/UX Theme customization styling
  theme: {
    primaryColor: '#0284c7',
    color: '#111827',
    background: '#ffffff',
    themeColorLight: '#ffffff',
    themeColorDark: '#030712'
  },

  // Pagination setups
  // Prefetch the previous/next post link on hover (read by PostNavigation.svelte)
  prefetch: {
    enabled: true
  },

  pagination: {
    postsPerPage: 10
  },

  // Social media profiles
  social: {
    facebook: '#',
    zalo: '#',
    github: 'https://github.com/NVCDevelopmentTeam',
    viber: '#'
  },

  // Backwards-compatibility alias getter method
  get url() {
    return this.siteUrl
  }
}
