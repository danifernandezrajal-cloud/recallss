import { applyRating, getDueEntries, createEntry } from '@/lib/sr'
import { Entry } from '@/lib/types'

const base: Entry = {
  id: '1', title: 'Test', why: 'Test why',
  category: 'test', created_at: '2026-05-20',
  next_review: '2026-05-20', interval: 1, ease: 2.5, review_count: 0,
}

describe('applyRating', () => {
  it('clear: ceil(1 * 2.5) = 3 days', () => {
    const result = applyRating(base, 'clear')
    expect(result.interval).toBe(3)
    expect(result.review_count).toBe(1)
  })

  it('clear from interval 3: ceil(3 * 2.5) = 8 days', () => {
    const result = applyRating({ ...base, interval: 3 }, 'clear')
    expect(result.interval).toBe(8)
  })

  it('fuzzy: always resets to 3', () => {
    const result = applyRating({ ...base, interval: 14 }, 'fuzzy')
    expect(result.interval).toBe(3)
  })

  it('blank: always resets to 1', () => {
    const result = applyRating({ ...base, interval: 14 }, 'blank')
    expect(result.interval).toBe(1)
  })

  it('sets next_review to today + interval', () => {
    const result = applyRating(base, 'clear')
    const expected = new Date()
    expected.setDate(expected.getDate() + 3)
    expect(result.next_review).toBe(expected.toISOString().split('T')[0])
  })
})

describe('getDueEntries', () => {
  it('returns entries where next_review <= today', () => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const entries: Entry[] = [
      { ...base, id: '1', next_review: yesterday },
      { ...base, id: '2', next_review: today },
      { ...base, id: '3', next_review: tomorrow },
    ]
    const due = getDueEntries(entries)
    expect(due.map(e => e.id)).toEqual(['1', '2'])
  })
})

describe('createEntry', () => {
  it('sets interval=1, ease=2.5, next_review=tomorrow', () => {
    const entry = createEntry({ title: 'Test', why: 'Why', category: 'cat' })
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    expect(entry.interval).toBe(1)
    expect(entry.ease).toBe(2.5)
    expect(entry.next_review).toBe(tomorrow)
    expect(entry.review_count).toBe(0)
  })
})
