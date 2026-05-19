# Recall App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Recall — a personal knowledge tracker PWA with spaced repetition, 9 topic categories, and offline-first localStorage storage.

**Architecture:** Next.js 14 App Router + Tailwind CSS dark theme. All data lives in localStorage via a single `storage.ts` module. Spaced repetition logic is pure functions in `sr.ts` (fully testable). Four screens (Home, Browse, Add, Review) plus Search, all navigated via a bottom nav bar.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, `@ducanh2912/next-pwa`, Jest + ts-jest

---

## File Map

| File | Purpose |
|------|---------|
| `src/lib/types.ts` | Entry, Category, Store, StreakData types |
| `src/lib/sr.ts` | Pure SR algorithm functions (testable) |
| `src/lib/storage.ts` | All localStorage read/write operations |
| `src/lib/__tests__/sr.test.ts` | SR algorithm tests |
| `src/app/layout.tsx` | Root layout: dark bg, BottomNav, PWA meta |
| `src/app/globals.css` | Global dark theme styles |
| `src/app/page.tsx` | Home: streak + due count + "Repasar ahora" |
| `src/app/add/page.tsx` | Quick capture form |
| `src/app/browse/page.tsx` | Category grid |
| `src/app/browse/[category]/page.tsx` | Entry list for one category |
| `src/app/entry/[id]/page.tsx` | Entry detail + edit + delete |
| `src/app/review/page.tsx` | Spaced repetition review session |
| `src/app/search/page.tsx` | Full-text search |
| `src/components/BottomNav.tsx` | Tab bar: Home / Browse / Add / Review / Search |
| `src/components/EntryCard.tsx` | Reusable entry display card |
| `src/components/RatingButtons.tsx` | ✅ 〜 ✗ rating buttons |
| `src/components/CategoryCard.tsx` | Category tile for browse grid |
| `public/manifest.json` | PWA manifest |
| `tailwind.config.ts` | Dark theme color palette |
| `next.config.mjs` | Next.js + PWA config |

---

## Task 1: Scaffold Project

**Files:**
- Create: all Next.js boilerplate

- [ ] **Step 1: Scaffold Next.js app into existing directory**

The `lab/recall` directory already exists with `.git` and `docs/`. Run from inside it:

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

When prompted about the existing directory, confirm yes. Accept all other defaults.

Expected: Next.js files created alongside the existing `docs/` folder.

- [ ] **Step 2: Install dependencies**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npm install @ducanh2912/next-pwa && npm install --save-dev jest @types/jest ts-jest
```

- [ ] **Step 3: Replace `tailwind.config.ts` with dark theme**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#0d0d0d',
        surface: '#141414',
        border:  '#2a2a2a',
        muted:   '#1e1e1e',
        subtle:  '#666666',
        accent:  '#818cf8',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 4: Replace `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }
body { background-color: #0d0d0d; color: white; font-family: system-ui, sans-serif; }
input, textarea, select { color-scheme: dark; }
```

- [ ] **Step 5: Replace `next.config.mjs`**

```js
import withPWA from '@ducanh2912/next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})(nextConfig)
```

- [ ] **Step 6: Add Jest config to `package.json`**

Add these two fields to `package.json`:

```json
"scripts": {
  "test": "jest"
},
"jest": {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}
```

- [ ] **Step 7: Verify build**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js 14 project with dark theme and PWA config"
```

---

## Task 2: Types + SR Algorithm + Tests

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/sr.ts`
- Create: `src/lib/__tests__/sr.test.ts`

- [ ] **Step 1: Create `src/lib/types.ts`**

```ts
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
```

- [ ] **Step 2: Write failing tests in `src/lib/__tests__/sr.test.ts`**

```ts
import { applyRating, getDueEntries, createEntry } from '@/lib/sr'
import { Entry, Rating } from '@/lib/types'

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
```

- [ ] **Step 3: Run tests — verify they fail**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npm test 2>&1 | tail -10
```

Expected: FAIL — `sr` module not found.

- [ ] **Step 4: Create `src/lib/sr.ts`**

```ts
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
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npm test 2>&1 | tail -10
```

Expected: All 7 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/sr.ts src/lib/__tests__/sr.test.ts
git commit -m "feat: add types, SR algorithm, and passing tests"
```

---

## Task 3: Storage Layer

**Files:**
- Create: `src/lib/storage.ts`

- [ ] **Step 1: Create `src/lib/storage.ts`**

```ts
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
    if (!raw) return { ...DEFAULT_STORE }
    return JSON.parse(raw) as Store
  } catch {
    return { ...DEFAULT_STORE }
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/storage.ts
git commit -m "feat: add localStorage storage layer with CRUD and streak management"
```

---

## Task 4: Root Layout + BottomNav + PWA Meta

**Files:**
- Create: `src/components/BottomNav.tsx`
- Modify: `src/app/layout.tsx`
- Create: `public/manifest.json`

- [ ] **Step 1: Create `src/components/BottomNav.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/',        label: 'Home',    icon: '🏠' },
  { href: '/browse',  label: 'Browse',  icon: '📚' },
  { href: '/add',     label: 'Add',     icon: '✚' },
  { href: '/review',  label: 'Review',  icon: '🔁' },
  { href: '/search',  label: 'Search',  icon: '🔍' },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex z-40">
      {tabs.map(tab => {
        const active = tab.href === '/' ? path === '/' : path.startsWith(tab.href)
        return (
          <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center py-2 gap-0.5">
            <span className="text-lg">{tab.icon}</span>
            <span className={`text-[9px] tracking-widest ${active ? 'text-accent' : 'text-subtle'}`}>
              {tab.label.toUpperCase()}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Recall',
  description: 'Personal knowledge tracker with spaced repetition',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Recall' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#0d0d0d" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-bg text-white">
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create `public/manifest.json`**

```json
{
  "name": "Recall",
  "short_name": "Recall",
  "description": "Personal knowledge tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d0d0d",
  "theme_color": "#0d0d0d",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 4: Generate placeholder icons**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && node -e "
const { createCanvas } = require('canvas') 
" 2>/dev/null || echo "canvas not available — copy icons from goaltracker as placeholders"
```

If canvas is not available, copy icons from GoalTracker:
```bash
cp "/Users/daniel/Desktop/Projects Code/lab/goaltracker/public/icon-192.png" "/Users/daniel/Desktop/Projects Code/lab/recall/public/icon-192.png"
cp "/Users/daniel/Desktop/Projects Code/lab/goaltracker/public/icon-512.png" "/Users/daniel/Desktop/Projects Code/lab/recall/public/icon-512.png"
cp "/Users/daniel/Desktop/Projects Code/lab/goaltracker/public/apple-touch-icon.png" "/Users/daniel/Desktop/Projects Code/lab/recall/public/apple-touch-icon.png"
```

- [ ] **Step 5: Verify build**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/BottomNav.tsx src/app/layout.tsx public/manifest.json public/
git commit -m "feat: add root layout, bottom nav, PWA manifest and icons"
```

---

## Task 5: Home Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getStore, getDueToday } from '@/lib/storage'
import { Entry } from '@/lib/types'

export default function HomePage() {
  const [due, setDue] = useState<Entry[]>([])
  const [streak, setStreak] = useState(0)
  const [total, setTotal] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const store = getStore()
    setDue(getDueToday())
    setStreak(store.streak.streak)
    setTotal(store.entries.length)
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <div className="text-[11px] tracking-widest text-subtle uppercase mb-1">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <div className="text-[22px] font-bold">Recall 🧠</div>
      </div>

      <div className="px-4 pt-6 flex flex-col gap-4">
        {/* Streak */}
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-widest text-subtle mb-1">RACHA</div>
            <div className="text-2xl font-extrabold text-accent">{streak} días</div>
          </div>
          <div className="text-4xl">🔥</div>
        </div>

        {/* Review CTA */}
        {due.length > 0 ? (
          <Link href="/review">
            <div className="bg-accent/10 border border-accent rounded-xl p-5 text-center">
              <div className="text-[10px] tracking-widest text-subtle mb-2">PENDIENTES HOY</div>
              <div className="text-3xl font-extrabold text-accent mb-3">{due.length}</div>
              <div className="bg-accent text-white font-bold py-3 rounded-lg text-sm tracking-widest">
                REPASAR AHORA →
              </div>
            </div>
          </Link>
        ) : (
          <div className="bg-surface border border-border rounded-xl p-5 text-center">
            <div className="text-2xl mb-2">✓</div>
            <div className="text-white font-bold">Todo al día</div>
            <div className="text-subtle text-sm mt-1">No hay entradas pendientes</div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="text-[10px] tracking-widest text-subtle mb-3">BIBLIOTECA</div>
          <div className="text-2xl font-extrabold text-white">{total} <span className="text-sm font-normal text-subtle">entradas guardadas</span></div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add home page with streak, due count, and review CTA"
```

---

## Task 6: Add Entry Page

**Files:**
- Create: `src/app/add/page.tsx`

- [ ] **Step 1: Create `src/app/add/page.tsx`**

```tsx
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCategories, addEntry } from '@/lib/storage'
import { Category } from '@/lib/types'

export default function AddPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')
  const [category, setCategory] = useState('')
  const [source, setSource] = useState('')
  const [connects, setConnects] = useState('')
  const [application, setApplication] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const cats = getCategories()
    setCategories(cats)
    if (cats.length > 0) setCategory(cats[0].name)
  }, [])

  function handleSave() {
    if (!title.trim() || !why.trim() || !category) return
    setSaving(true)
    addEntry({
      title: title.trim(),
      why: why.trim(),
      category,
      source: source.trim() || undefined,
      connects: connects.trim() || undefined,
      application: application.trim() || undefined,
    })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <div className="text-[11px] tracking-widest text-subtle uppercase mb-1">Nueva entrada</div>
        <div className="text-[22px] font-bold">✚ Añadir</div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Title */}
        <div>
          <label className="text-[9px] tracking-widest text-subtle block mb-1">🧩 IDEA / TÍTULO *</label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="¿Cuál es la idea?"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent"
          />
        </div>

        {/* Why */}
        <div>
          <label className="text-[9px] tracking-widest text-subtle block mb-1">🧠 POR QUÉ IMPORTA *</label>
          <textarea
            value={why}
            onChange={e => setWhy(e.target.value)}
            placeholder="¿Por qué te importa esto? ¿Qué aprendiste?"
            rows={3}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-[9px] tracking-widest text-subtle block mb-1">CATEGORÍA *</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent"
          >
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
            ))}
          </select>
        </div>

        {/* Optional fields toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] tracking-widest text-subtle text-left py-1"
        >
          {expanded ? '▲ OCULTAR DETALLES' : '▼ AÑADIR MÁS DETALLE (opcional)'}
        </button>

        {expanded && (
          <>
            <div>
              <label className="text-[9px] tracking-widest text-subtle block mb-1">📍 FUENTE</label>
              <input
                type="text"
                value={source}
                onChange={e => setSource(e.target.value)}
                placeholder="Libro, artículo, persona..."
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[9px] tracking-widest text-subtle block mb-1">🔗 CONECTA CON</label>
              <input
                type="text"
                value={connects}
                onChange={e => setConnects(e.target.value)}
                placeholder="¿Con qué otra idea conecta?"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[9px] tracking-widest text-subtle block mb-1">⚡ APLICACIÓN REAL</label>
              <textarea
                value={application}
                onChange={e => setApplication(e.target.value)}
                placeholder="¿Cómo lo puedes aplicar?"
                rows={2}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent resize-none"
              />
            </div>
          </>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !why.trim()}
          className="w-full bg-accent text-white font-bold py-4 rounded-xl text-sm tracking-widest disabled:opacity-40 mt-2"
        >
          {saving ? 'GUARDANDO...' : 'GUARDAR ENTRADA'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/add/page.tsx
git commit -m "feat: add entry form with quick capture and expandable optional fields"
```

---

## Task 7: Browse + Entry Detail

**Files:**
- Create: `src/components/CategoryCard.tsx`
- Create: `src/components/EntryCard.tsx`
- Create: `src/app/browse/page.tsx`
- Create: `src/app/browse/[category]/page.tsx`
- Create: `src/app/entry/[id]/page.tsx`

- [ ] **Step 1: Create `src/components/CategoryCard.tsx`**

```tsx
import Link from 'next/link'
import { Category } from '@/lib/types'

type Props = { category: Category; count: number }

export default function CategoryCard({ category, count }: Props) {
  return (
    <Link href={`/browse/${encodeURIComponent(category.name)}`}>
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2 active:opacity-70">
        <div className="text-3xl">{category.emoji}</div>
        <div className="text-white font-bold text-sm leading-tight">{category.name}</div>
        <div className="text-[10px] tracking-widest text-subtle">{count} {count === 1 ? 'entrada' : 'entradas'}</div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create `src/components/EntryCard.tsx`**

```tsx
import Link from 'next/link'
import { Entry } from '@/lib/types'

type Props = { entry: Entry; showCategory?: boolean }

export default function EntryCard({ entry, showCategory }: Props) {
  return (
    <Link href={`/entry/${entry.id}`}>
      <div className="bg-surface border border-border rounded-xl p-4 active:opacity-70">
        <div className="flex justify-between items-start mb-2">
          <div className="text-white font-bold text-sm flex-1 pr-2">{entry.title}</div>
          {showCategory && (
            <span className="text-[9px] tracking-widest text-subtle shrink-0">{entry.category}</span>
          )}
        </div>
        <div className="text-subtle text-xs line-clamp-2">{entry.why}</div>
        <div className="text-[9px] tracking-widest text-subtle mt-2">
          {new Date(entry.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: Create `src/app/browse/page.tsx`**

```tsx
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { getStore } from '@/lib/storage'
import { Category, Entry } from '@/lib/types'
import CategoryCard from '@/components/CategoryCard'

export default function BrowsePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const store = getStore()
    setCategories(store.categories)
    setEntries(store.entries)
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <div className="text-[11px] tracking-widest text-subtle uppercase mb-1">Biblioteca</div>
        <div className="text-[22px] font-bold">📚 Browse</div>
      </div>
      <div className="px-4 pt-4 grid grid-cols-2 gap-3">
        {categories.map(cat => (
          <CategoryCard
            key={cat.id}
            category={cat}
            count={entries.filter(e => e.category === cat.name).length}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/app/browse/[category]/page.tsx`**

```tsx
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getStore } from '@/lib/storage'
import { Entry } from '@/lib/types'
import EntryCard from '@/components/EntryCard'

export default function CategoryPage() {
  const params = useParams()
  const categoryName = decodeURIComponent(params.category as string)
  const [entries, setEntries] = useState<Entry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const store = getStore()
    setEntries(store.entries.filter(e => e.category === categoryName))
    setMounted(true)
  }, [categoryName])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="px-5 pt-5 pb-3 border-b border-border flex items-center gap-3">
        <Link href="/browse" className="text-subtle text-sm">← </Link>
        <div>
          <div className="text-[11px] tracking-widest text-subtle uppercase mb-1">Categoría</div>
          <div className="text-[20px] font-bold">{categoryName}</div>
        </div>
      </div>
      <div className="px-4 pt-4 flex flex-col gap-3">
        {entries.length === 0 ? (
          <div className="text-center text-subtle py-12 text-sm">No hay entradas en esta categoría</div>
        ) : (
          entries.map(entry => <EntryCard key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/app/entry/[id]/page.tsx`**

```tsx
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getStore, updateEntry, deleteEntry } from '@/lib/storage'
import { Entry } from '@/lib/types'

export default function EntryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')
  const [source, setSource] = useState('')
  const [connects, setConnects] = useState('')
  const [application, setApplication] = useState('')

  useEffect(() => {
    const store = getStore()
    const found = store.entries.find(e => e.id === params.id)
    if (found) {
      setEntry(found)
      setTitle(found.title)
      setWhy(found.why)
      setSource(found.source || '')
      setConnects(found.connects || '')
      setApplication(found.application || '')
    }
  }, [params.id])

  function handleSave() {
    if (!entry) return
    updateEntry(entry.id, {
      title: title.trim(),
      why: why.trim(),
      source: source.trim() || undefined,
      connects: connects.trim() || undefined,
      application: application.trim() || undefined,
    })
    setEntry({ ...entry, title, why, source: source || undefined, connects: connects || undefined, application: application || undefined })
    setEditing(false)
  }

  function handleDelete() {
    if (!entry) return
    if (confirm('¿Eliminar esta entrada?')) {
      deleteEntry(entry.id)
      router.back()
    }
  }

  if (!entry) return null

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="px-5 pt-5 pb-3 border-b border-border flex justify-between items-start">
        <div>
          <button onClick={() => router.back()} className="text-subtle text-sm mb-1 block">←</button>
          <div className="text-[10px] tracking-widest text-subtle">{entry.category}</div>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => setEditing(!editing)} className="text-[10px] tracking-widest text-accent border border-accent rounded-lg px-3 py-1.5">
            {editing ? 'CANCELAR' : 'EDITAR'}
          </button>
          <button onClick={handleDelete} className="text-[10px] tracking-widest text-red-400 border border-red-400/40 rounded-lg px-3 py-1.5">
            BORRAR
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {editing ? (
          <>
            {[
              { label: '🧩 IDEA', value: title, set: setTitle, rows: 1 },
              { label: '🧠 POR QUÉ IMPORTA', value: why, set: setWhy, rows: 3 },
              { label: '📍 FUENTE', value: source, set: setSource, rows: 1 },
              { label: '🔗 CONECTA CON', value: connects, set: setConnects, rows: 1 },
              { label: '⚡ APLICACIÓN REAL', value: application, set: setApplication, rows: 2 },
            ].map(({ label, value, set, rows }) => (
              <div key={label}>
                <label className="text-[9px] tracking-widest text-subtle block mb-1">{label}</label>
                <textarea
                  value={value}
                  onChange={e => set(e.target.value)}
                  rows={rows}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent resize-none"
                />
              </div>
            ))}
            <button onClick={handleSave} className="w-full bg-accent text-white font-bold py-4 rounded-xl text-sm tracking-widest">
              GUARDAR CAMBIOS
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-white">{entry.title}</h1>
            {[
              { label: '🧠 Por qué importa', value: entry.why },
              { label: '📍 Fuente', value: entry.source },
              { label: '🔗 Conecta con', value: entry.connects },
              { label: '⚡ Aplicación real', value: entry.application },
            ].filter(f => f.value).map(({ label, value }) => (
              <div key={label} className="bg-surface border border-border rounded-xl p-4">
                <div className="text-[9px] tracking-widest text-subtle mb-2">{label.toUpperCase()}</div>
                <div className="text-white text-sm">{value}</div>
              </div>
            ))}
            <div className="text-[10px] text-subtle text-center pt-2">
              Guardado: {new Date(entry.created_at).toLocaleDateString('es-ES')} · Repasos: {entry.review_count}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Add "Nueva categoría" form to `src/app/browse/page.tsx`**

After the categories grid, add this section before the closing `</div>` of the outer container:

```tsx
const [newName, setNewName] = useState('')
const [newEmoji, setNewEmoji] = useState('')
const [adding, setAdding] = useState(false)

function handleAddCategory() {
  if (!newName.trim() || !newEmoji.trim()) return
  const cat = addCategory(newName.trim(), newEmoji.trim())
  setCategories(prev => [...prev, cat])
  setNewName('')
  setNewEmoji('')
  setAdding(false)
}
```

And in the JSX, after the grid:

```tsx
<div className="mt-4">
  {!adding ? (
    <button onClick={() => setAdding(true)} className="text-[10px] tracking-widest text-subtle w-full py-3 border border-dashed border-border rounded-xl">
      + NUEVA CATEGORÍA
    </button>
  ) : (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="text-[9px] tracking-widest text-subtle">NUEVA CATEGORÍA</div>
      <div className="flex gap-2">
        <input value={newEmoji} onChange={e => setNewEmoji(e.target.value)} placeholder="🏷️" className="w-12 bg-muted border border-border rounded-lg px-2 py-2 text-white text-sm text-center outline-none" maxLength={2} />
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre..." className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-accent" />
      </div>
      <div className="flex gap-2">
        <button onClick={handleAddCategory} disabled={!newName.trim() || !newEmoji.trim()} className="flex-1 bg-accent text-white text-xs font-bold py-2 rounded-lg disabled:opacity-40">AÑADIR</button>
        <button onClick={() => setAdding(false)} className="flex-1 border border-border text-subtle text-xs py-2 rounded-lg">CANCELAR</button>
      </div>
    </div>
  )}
</div>
```

Also add `addCategory` to the storage import at the top of browse/page.tsx:
```tsx
import { getStore, addCategory } from '@/lib/storage'
```

- [ ] **Step 7: Verify build**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/components/CategoryCard.tsx src/components/EntryCard.tsx src/app/browse/ src/app/entry/
git commit -m "feat: add browse pages, category grid, entry list, entry detail, and add-category form"
```

---

## Task 8: Review Session

**Files:**
- Create: `src/components/RatingButtons.tsx`
- Create: `src/app/review/page.tsx`

- [ ] **Step 1: Create `src/components/RatingButtons.tsx`**

```tsx
import { Rating } from '@/lib/types'

type Props = { onRate: (r: Rating) => void; disabled?: boolean }

export default function RatingButtons({ onRate, disabled }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {([
        { rating: 'blank' as Rating,  label: '✗ No recordaba', cls: 'border-red-500/50 text-red-400' },
        { rating: 'fuzzy' as Rating,  label: '〜 Más o menos',  cls: 'border-yellow-500/50 text-yellow-400' },
        { rating: 'clear' as Rating,  label: '✓ Lo tenía claro', cls: 'border-green-500/50 text-green-400' },
      ]).map(({ rating, label, cls }) => (
        <button
          key={rating}
          onClick={() => onRate(rating)}
          disabled={disabled}
          className={`border rounded-xl py-3 text-[10px] font-bold tracking-wide text-center disabled:opacity-40 ${cls}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/review/page.tsx`**

```tsx
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDueToday, rateEntry, completeReviewSession } from '@/lib/storage'
import { Entry, Rating } from '@/lib/types'
import RatingButtons from '@/components/RatingButtons'

export default function ReviewPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [rated, setRated] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setEntries(getDueToday())
    setMounted(true)
  }, [])

  function handleRate(entry: Entry, rating: Rating) {
    rateEntry(entry.id, rating)
    setRated(prev => new Set([...prev, entry.id]))
  }

  function handleFinish() {
    completeReviewSession()
    router.push('/')
  }

  if (!mounted) return null

  const allRated = entries.length > 0 && rated.size === entries.length

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-bg pb-20 flex flex-col items-center justify-center gap-4">
        <div className="text-4xl">✓</div>
        <div className="text-white font-bold">Todo al día</div>
        <div className="text-subtle text-sm">No hay entradas pendientes para hoy</div>
        <button onClick={() => router.push('/')} className="text-accent text-sm tracking-widest mt-4">← VOLVER</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <div className="text-[11px] tracking-widest text-subtle uppercase mb-1">Sesión de repaso</div>
        <div className="text-[22px] font-bold">🔁 Review</div>
        {/* Progress bar */}
        <div className="mt-3 bg-muted rounded h-1.5 overflow-hidden">
          <div
            className="h-full bg-accent rounded transition-all duration-500"
            style={{ width: `${(rated.size / entries.length) * 100}%` }}
          />
        </div>
        <div className="text-[10px] tracking-widest text-subtle mt-1">{rated.size} / {entries.length} repasadas</div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {entries.map(entry => (
          <div key={entry.id} className={`bg-surface border rounded-xl p-4 transition-opacity ${rated.has(entry.id) ? 'opacity-40' : 'border-border'}`}>
            <div className="text-[9px] tracking-widest text-subtle mb-1">{entry.category}</div>
            <div className="text-white font-bold mb-3">{entry.title}</div>

            <div className="flex flex-col gap-2 mb-4">
              {[
                { label: '🧠 POR QUÉ IMPORTA', value: entry.why },
                { label: '📍 FUENTE', value: entry.source },
                { label: '🔗 CONECTA CON', value: entry.connects },
                { label: '⚡ APLICACIÓN', value: entry.application },
              ].filter(f => f.value).map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[8px] tracking-widest text-subtle mb-0.5">{label}</div>
                  <div className="text-white text-xs">{value}</div>
                </div>
              ))}
            </div>

            <RatingButtons onRate={r => handleRate(entry, r)} disabled={rated.has(entry.id)} />
          </div>
        ))}

        {allRated && (
          <button
            onClick={handleFinish}
            className="w-full bg-accent text-white font-bold py-4 rounded-xl text-sm tracking-widest mt-2"
          >
            TERMINAR SESIÓN 🎉
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/RatingButtons.tsx src/app/review/page.tsx
git commit -m "feat: add review session with SR rating buttons and streak completion"
```

---

## Task 9: Search Page

**Files:**
- Create: `src/app/search/page.tsx`

- [ ] **Step 1: Create `src/app/search/page.tsx`**

```tsx
'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { getStore } from '@/lib/storage'
import { Entry } from '@/lib/types'
import EntryCard from '@/components/EntryCard'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [allEntries, setAllEntries] = useState<Entry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setAllEntries(getStore().entries)
    setMounted(true)
  }, [])

  const results = query.trim().length < 2 ? [] : allEntries.filter(e => {
    const q = query.toLowerCase()
    return (
      e.title.toLowerCase().includes(q) ||
      e.why.toLowerCase().includes(q) ||
      (e.source?.toLowerCase().includes(q) ?? false) ||
      (e.connects?.toLowerCase().includes(q) ?? false) ||
      (e.application?.toLowerCase().includes(q) ?? false)
    )
  })

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <div className="text-[11px] tracking-widest text-subtle uppercase mb-1">Buscar</div>
        <div className="text-[22px] font-bold">🔍 Search</div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar en todas las entradas..."
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-accent"
        />

        {query.trim().length >= 2 && (
          <div className="text-[10px] tracking-widest text-subtle">
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {results.map(entry => (
            <EntryCard key={entry.id} entry={entry} showCategory />
          ))}
        </div>

        {query.trim().length >= 2 && results.length === 0 && (
          <div className="text-center text-subtle py-8 text-sm">Sin resultados para "{query}"</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npm test 2>&1 | tail -10
```

Expected: All 7 tests pass.

- [ ] **Step 3: Final build**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && npm run build 2>&1 | tail -10
```

Expected: Build succeeds, all routes compiled.

- [ ] **Step 4: Commit**

```bash
git add src/app/search/page.tsx
git commit -m "feat: add full-text search page"
```

---

## Task 10: Deploy to Vercel

**Files:**
- No code changes — GitHub push + Vercel setup

- [ ] **Step 1: Create GitHub repo and push**

```bash
cd "/Users/daniel/Desktop/Projects Code/lab/recall" && gh repo create recall --private --source=. --push
```

Expected: Repo created at `github.com/danifernandezrajal-cloud/recall` and code pushed.

- [ ] **Step 2: Import to Vercel**

Go to vercel.com → **Add New Project** → import `recall` repo → before deploying, add environment variables:

_(No env vars needed — app uses localStorage only)_

Click **Deploy**.

- [ ] **Step 3: Verify deploy**

Open the Vercel URL (e.g. `recall-xxx.vercel.app`) in iPhone Safari.

- [ ] **Step 4: Install as PWA**

In Safari: Share → **Añadir a pantalla de inicio** → confirm.

---

## Manual Verification Checklist

After deploy, verify on phone:

- [ ] Home shows streak (0 days initially) and "Todo al día" (no entries yet)
- [ ] Add page: can save an entry with just title + why + category
- [ ] Add page: optional fields expand when tapped
- [ ] Browse page: 9 category tiles visible, entry count updates after adding
- [ ] Entry detail: can edit and delete
- [ ] Review page: shows "Todo al día" when no entries due (all new entries review tomorrow)
- [ ] Search: returns results when typing 2+ characters
- [ ] App installs as PWA on home screen
