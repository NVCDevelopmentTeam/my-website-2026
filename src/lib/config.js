export const siteConfig = {
  title: 'Góc thư giãn',
  description: 'Lan tỏa nguồn năng lượng tích cực mỗi ngày',
  author: {
    name: 'Coding Nguyễn',
    email: 'contact@codingnguyen.dev',
    accessKey: ''
  },

  siteDomain: 'nhatkyanhsang.vn',
  siteUrl: 'https://nhatkyanhsang.vn',
  language: 'vi',

  theme: {
    color: '#333333',
    background: '#ffffff'
  },

  // Standard pagination for the entire site
  pagination: {
    postsPerPage: 10
  },

  social: {
    facebook: '/',
    zalo: '/',
    github: 'https://github.com/NVCDevelopmentTeam',
    viber: '/'
  },

  // Backwards-compatibility alias:
  // Some older files referenced `siteConfig.url`. Keep an alias so we don't
  // break runtime immediately. Primary canonical value remains `siteUrl`.
  get url() {
    return this.siteUrl;
  }
}