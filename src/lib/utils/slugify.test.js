import { describe, it, expect } from 'vitest'
import { slugify } from './slugify.js'

describe('slugify', () => {
  it('returns empty string for falsy input', () => {
    expect(slugify('')).toBe('')
    expect(slugify(null)).toBe('')
    expect(slugify(undefined)).toBe('')
  })

  it('converts basic text to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
    expect(slugify('FOO BAR BAZ')).toBe('foo-bar-baz')
  })

  it('removes Vietnamese diacritics', () => {
    expect(slugify('Xin chào Việt Nam')).toBe('xin-chao-viet-nam')
    expect(slugify('Tương lai ngành lập trình')).toBe('tuong-lai-nganh-lap-trinh')
    expect(slugify('Đây là bài viết')).toBe('day-la-bai-viet')
  })

  it('handles Vietnamese đ/Đ character', () => {
    expect(slugify('đường')).toBe('duong')
    expect(slugify('Đà Nẵng')).toBe('da-nang')
  })

  it('removes special characters', () => {
    expect(slugify('hello@world!')).toBe('helloworld')
    expect(slugify('price: $100')).toBe('price-100')
    expect(slugify('test (something)')).toBe('test-something')
  })

  it('replaces multiple spaces with single hyphen', () => {
    expect(slugify('hello   world')).toBe('hello-world')
    expect(slugify('hello _ world')).toBe('hello-world')
  })

  it('removes underscores (non-alphanumeric)', () => {
    // underscores are stripped by the [^a-z0-9\s-] regex before space replacement
    expect(slugify('hello___world')).toBe('helloworld')
  })

  it('removes leading and trailing hyphens', () => {
    expect(slugify('--hello--')).toBe('hello')
    expect(slugify('-test-')).toBe('test')
  })

  it('collapses multiple consecutive hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world')
  })

  it('handles numbers', () => {
    expect(slugify('test 123')).toBe('test-123')
    expect(slugify('2025 năm mới')).toBe('2025-nam-moi')
  })

  it('trims whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world')
  })
})
