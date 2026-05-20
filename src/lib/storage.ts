import { Store, Entry, Category, Rating } from '@/lib/types'
import { applyRating, createEntry, getDueEntries } from '@/lib/sr'

const KEY = 'recall_data'

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Mental Models & Psychology', emoji: '🧠', isDefault: true },
  { id: '2', name: 'Markets, Finance & Economy', emoji: '📈', isDefault: true },
  { id: '3', name: 'Business & Strategy',         emoji: '🏢', isDefault: true },
  { id: '4', name: 'World & Society',              emoji: '🌍', isDefault: true },
  { id: '5', name: 'Personal Growth & Identity',  emoji: '🚀', isDefault: true },
  { id: '6', name: 'Communication & Charisma',    emoji: '🗣️', isDefault: true },
  { id: '7', name: 'Random High-Value Facts',     emoji: '💡', isDefault: true },
  { id: '8', name: 'Connections',                 emoji: '🔗', isDefault: true },
  { id: '9', name: 'Things I Want To Become',     emoji: '🎯', isDefault: true },
]

const DEFAULT_STORE: Store = {
  entries: [],
  categories: DEFAULT_CATEGORIES,
  streak: { lastReviewDate: '', streak: 0 },
}

export function getStore(): Store {
  if (typeof window === 'undefined') return DEFAULT_STORE
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_STORE, categories: [...DEFAULT_CATEGORIES] }
    return JSON.parse(raw) as Store
  } catch {
    return { ...DEFAULT_STORE, categories: [...DEFAULT_CATEGORIES] }
  }
}

function saveStore(store: Store): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(store))
}

export function getCategories(): Category[] {
  return getStore().categories
}

export function addCategory(name: string, emoji: string): Category {
  const store = getStore()
  const category: Category = {
    id: crypto.randomUUID(),
    name,
    emoji,
    isDefault: false,
  }
  store.categories.push(category)
  saveStore(store)
  return category
}

export function getDueToday(): Entry[] {
  return getDueEntries(getStore().entries)
}

export function addEntry(
  fields: Pick<Entry, 'title' | 'why' | 'category'> & Partial<Pick<Entry, 'source' | 'connects' | 'application'>>
): Entry {
  const store = getStore()
  const entry: Entry = {
    id: crypto.randomUUID(),
    ...createEntry(fields),
  }
  store.entries.push(entry)
  saveStore(store)
  return entry
}

export function updateEntry(id: string, patch: Partial<Entry>): void {
  const store = getStore()
  store.entries = store.entries.map(e => e.id === id ? { ...e, ...patch } : e)
  saveStore(store)
}

export function deleteEntry(id: string): void {
  const store = getStore()
  store.entries = store.entries.filter(e => e.id !== id)
  saveStore(store)
}

export function rateEntry(id: string, rating: Rating): void {
  const store = getStore()
  const entry = store.entries.find(e => e.id === id)
  if (!entry) return
  const updates = applyRating(entry, rating)
  store.entries = store.entries.map(e => e.id === id ? { ...e, ...updates } : e)
  saveStore(store)
}

export function exportStore(): void {
  const store = getStore()
  const json = JSON.stringify(store, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `recall-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importStore(json: string): void {
  const parsed = JSON.parse(json) as Store
  if (!parsed.entries || !parsed.categories) throw new Error('Archivo inválido')
  saveStore(parsed)
}

export function completeReviewSession(): void {
  const store = getStore()
  const today = new Date().toISOString().split('T')[0]
  const { lastReviewDate, streak } = store.streak

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const newStreak = lastReviewDate === yesterday || lastReviewDate === today
    ? (lastReviewDate === today ? streak : streak + 1)
    : 1

  store.streak = { lastReviewDate: today, streak: newStreak }
  saveStore(store)
}
