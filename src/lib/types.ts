export type Entry = {
  id: string
  title: string
  why: string
  source?: string
  connects?: string
  application?: string
  category: string
  created_at: string
  next_review: string
  interval: number
  ease: number
  review_count: number
}

export type Category = {
  id: string
  name: string
  emoji: string
  isDefault: boolean
}

export type StreakData = {
  lastReviewDate: string
  streak: number
}

export type Store = {
  entries: Entry[]
  categories: Category[]
  streak: StreakData
}

export type Rating = 'clear' | 'fuzzy' | 'blank'
