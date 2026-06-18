import { describe, it, expect } from 'vitest'
import { truncate } from './truncate.js'

describe('truncate', () => {
  it('returns original text if shorter than length', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
    expect(truncate('Short', 100)).toBe('Short')
  })

  it('returns original text if exactly equal to length', () => {
    expect(truncate('12345', 5)).toBe('12345')
  })

  it('returns falsy input as-is', () => {
    expect(truncate('', 10)).toBe('')
    expect(truncate(null, 10)).toBe(null)
    expect(truncate(undefined, 10)).toBe(undefined)
  })

  it('truncates at word boundary with default suffix', () => {
    const text = 'The quick brown fox jumps over the lazy dog'
    const result = truncate(text, 20)
    expect(result.length).toBeLessThanOrEqual(23) // 20 + '...'
    expect(result).toContain('...')
    expect(result).not.toMatch(/\s\.\.\./) // no space before suffix
  })

  it('uses custom suffix', () => {
    const text = 'This is a long text that needs truncation'
    const result = truncate(text, 15, '…')
    expect(result).toContain('…')
    expect(result).not.toContain('...')
  })

  it('prefers sentence terminators near the end', () => {
    // With length=50, searchBuffer = 10 (20% of 50), so terminator must be > 40
    const text = 'This is some filler text that goes on. And then more words here plus extra.'
    const result = truncate(text, 50)
    // The period at position 37 is NOT within the last 20% (pos > 40), so it falls back to word boundary
    expect(result).toContain('...')
  })

  it('falls back to word boundary when no sentence terminator', () => {
    const text = 'word1 word2 word3 word4 word5 word6'
    const result = truncate(text, 15)
    expect(result).toBe('word1 word2...')
  })

  it('handles text with no spaces', () => {
    const text = 'abcdefghijklmnopqrstuvwxyz'
    const result = truncate(text, 10)
    expect(result).toBe('abcdefghij...')
  })

  it('handles exclamation and question marks as sentence terminators', () => {
    // length=23, truncated="Some words here ok! And"
    // searchBuffer = floor(23*0.2) = 4, threshold = 23-4 = 19
    // '!' is at position 18, 18 < 19 so it won't match
    // Need: '!' position > length - searchBuffer
    // length=22, "Abcde fghij klmno pq! " -> '!' at pos 20, threshold=18, 20>18 ✓
    const text = 'Abcde fghij klmno pq! And then more words here'
    const result = truncate(text, 22)
    // '!' at position 20, searchBuffer=4, threshold=18, 20>18 so cuts at '!'
    expect(result).toBe('Abcde fghij klmno pq!')
  })
})
