export const ssr = true
export const prerender = true

export const load = async ({ fetch }) => {
  try {
    const response = await fetch('/sveltiaconfig.json')
    if (!response.ok) {
      throw new Error('Không thể tải cấu hình CMS')
    }
    const config = await response.json()
    return {
      config
    }
  } catch (error) {
    console.error('Error loading configuration:', error)
    return {
      config: null,
      error: 'Không thể kết nối với hệ thống quản trị. Vui lòng thử lại sau.'
    }
  }
}
