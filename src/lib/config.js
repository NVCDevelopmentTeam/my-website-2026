import { dev } from '$app/environment'

export const siteConfig = {
  // Site metadata
  title: 'Góc thư giãn',
  description: 'Lan tỏa nguồn năng lượng tích cực mỗi ngày',
  siteDomain: 'nhatkyanhsang.vn',
  siteUrl: dev ? 'http://localhost:5173' : 'https://nhatkyanhsang.vn',
  language: 'vi',
  // Geo metadata for SEO
  geo: {
    region: 'VN',
    placename: 'Ho Chi Minh City',
    position: '10.762622;106.660172',
    icbm: '10.762622, 106.660172'
  },

  // Author info
  author: {
    name: 'Coding Nguyễn',
    email: 'contact@codingnguyen.dev',
    // Public Access Key for Web3Forms (https://web3forms.com/)
    // DO NOT put private/secret keys here as this file is exposed to the client.
    accessKey: ''
  },

  // Blog configuration
  blog: {
    basePath: '/blog',
    postsPerPage: 10
  },

  // Theme settings
  theme: {
    color: '#333333',
    background: '#ffffff'
  },

  // Pagination (legacy support)
  pagination: {
    postsPerPage: 10
  },

  // Social links
  social: {
    facebook: '/',
    zalo: '/',
    github: 'https://github.com/NVCDevelopmentTeam',
    viber: '/'
  },

  // Backwards-compatibility alias
  get url() {
    return this.siteUrl
  }
}
