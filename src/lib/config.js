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
  siteDomain: 'codingnguyen2.appwrite.network',
  siteUrl: 'https://codingnguyen2.appwrite.network',
  language: 'vi',
  locale: 'vi_VN',
  timezone: 'Asia/Ha-noi',

  // Author details & Contact
  author: {
    name: 'Coding Nguyễn',
    email: 'contact@codingnguyen.dev',
    url: 'https://codingnguyen2.appwrite.network',
    // Public Access Key for Web3Forms (https://web3forms.com/)
    // DO NOT expose private or secret keys here as this file is accessible to the client.
    accessKey: ''
  },

  // Sveltia CMS & Git integration backend settings
  backend: {
    name: 'github',
    repo: 'NVCDevelopmentTeam/my-website-2026',
    branch: 'main'
  },

  // Appwrite Cloud project used as the OAuth2 token broker between Sveltia
  // CMS and GitHub (see routes/admin/+page.js / +page.svelte).
  appwrite: {
    endpoint: 'https://sgp.cloud.appwrite.io/v1',
    projectId: '698965f2000da6808b70'
  },

  // Geo metadata for SEO optimization
  geo: {
    region: 'VN',
    placename: 'Ha Noi',
    position: '10.762622;106.660172',
    icbm: '10.762622, 106.660172'
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
