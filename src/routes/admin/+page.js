import { error } from '@sveltejs/kit'

export const ssr = false
export const prerender = true

export const load = async ({ fetch }) => {
  try {
    const response = await fetch('/cmsConfig.json')
    if (!response.ok) {
      throw new Error(`CMS config fetch failed: ${response.status} ${response.statusText}`)
    }
    const config = await response.json()
    return {
      config
    }
  } catch (err) {
    console.error('Error loading CMS configuration:', err)
    error(500, 'Không thể kết nối với hệ thống quản trị. Vui lòng thử lại sau.')
  }
}
