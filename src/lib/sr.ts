import { Entry, Rating } from '@/lib/types'

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function dateFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function applyRating(entry: Entry, rating: Rating): Pick<Entry, 'interval' | 'next_review' | 'review_count'> {
  let interval: number

  if (rating === 'clear') {
    interval = Math.ceil(entry.interval * entry.ease)
  } else if (rating === 'fuzzy') {
    interval = 3
  } else {
    interval = 1
  }

  return {
    interval,
    next_review: dateFromNow(interval),
    review_count: entry.review_count + 1,
  }
}

export function getDueEntries(entries: Entry[]): Entry[] {
  const t = today()
  return entries.filter(e => e.next_review <= t)
}

export function createEntry(
  fields: Pick<Entry, 'title' | 'why' | 'category'> & Partial<Pick<Entry, 'source' | 'connects' | 'application'>>
): Omit<Entry, 'id'> {
  return {
    ...fields,
    created_at: today(),
    next_review: dateFromNow(1),
    interval: 1,
    ease: 2.5,
    review_count: 0,
  }
}
