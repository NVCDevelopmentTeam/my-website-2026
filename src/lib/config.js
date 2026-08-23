export const siteConfig = {
  // Site metadata
  title: 'Góc thư giãn',
  description: 'Lan tỏa nguồn năng lượng tích cực mỗi ngày',
  siteDomain: 'codingnguyen2.appwrite.network',
  siteUrl: 'https://codingnguyen2.appwrite.network',
  language: 'vi',

  // Sveltia CMS & Git integration backend settings
  backend: {
    name: 'github',
    repo: 'NVCDevelopmentTeam/my-website-2026',
    branch: 'main'
  },

  // Geo metadata for SEO optimization
  geo: {
    region: 'VN',
    placename: 'Ho Chi Minh City',
    position: '10.762622;106.660172',
    icbm: '10.762622, 106.660172'
  },

  // Author details
  author: {
    name: 'Coding Nguyễn',
    email: 'contact@codingnguyen.dev',
    // Public Access Key for Web3Forms (https://web3forms.com/)
    // DO NOT expose private or secret keys here as this file is accessible to the client.
    accessKey: ''
  },

  // Blog routing and core layouts
  blog: {
    basePath: '/blog',
    postsPerPage: 10
  },

  // UI/UX Theme customization styling
  theme: {
    color: '#333333',
    background: '#ffffff'
  },

  // Pagination setups (fallback support)
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
    return this.siteUrl;
  }
};
