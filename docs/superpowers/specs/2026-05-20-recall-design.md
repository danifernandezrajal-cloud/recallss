# Recall — Design Spec
Date: 2026-05-20

## Overview

Personal knowledge management (PKM) app with spaced repetition. Capture ideas, articles, and insights across 9 topic categories. Review them on a schedule that adapts to how well you remember each one.

**Project location:** `lab/recall`
**Tech stack:** Next.js 14, TypeScript, Tailwind CSS (dark theme), PWA
**Storage:** localStorage — no backend, works offline, never pauses

---

## Categories

9 fixed categories. User can add new ones from the app.

| Emoji | Name |
|-------|------|
| 🧠 | Mental Models & Psychology |
| 📈 | Markets, Finance & Economy |
| 🏢 | Business & Strategy |
| 🌍 | World & Society |
| 🚀 | Personal Growth & Identity |
| 🗣️ | Communication & Charisma |
| 💡 | Random High-Value Facts |
| 🔗 | Connections |
| 🎯 | Things I Want To Become |

Categories are stored in localStorage as an array so new ones can be appended. Default categories are seeded on first launch.

---

## Entry Structure

```ts
type Entry = {
  id: string            // uuid
  title: string         // required — "the idea"
  why: string           // required — personal note: why it matters
  source?: string       // optional — where it came from
  connects?: string     // optional — what it connects to
  application?: string  // optional — real-world application
  category: string      // category name
  created_at: string    // ISO date string
  next_review: string   // ISO date string — when to show next
  interval: number      // days until next review (SR algorithm)
  ease: number          // multiplier for interval growth (default 2.5)
  review_count: number  // total times reviewed
}
```

---

## Spaced Repetition Algorithm

Simple SM-2 variant. On each review the user rates the entry with one of 3 buttons:

| Rating | Label | Effect |
|--------|-------|--------|
| ✅ | Lo tenía claro | `interval = max(interval * ease, 1)` → rounds up to next integer day |
| 〜 | Más o menos | `interval = 3` (resets to 3 days) |
| ✗ | No lo recordaba | `interval = 1` (resets to tomorrow) |

Initial values on entry creation:
- `interval = 1` (first review tomorrow)
- `ease = 2.5`
- `next_review = tomorrow`

After rating, `next_review = today + interval days`.

**Due today:** entries where `next_review <= today`.

---

## Review Streak

- Stored in localStorage as `{ lastReviewDate: string, streak: number }`
- If user completes at least 1 review on a given day → streak increments
- If a day is skipped → streak resets to 0
- Streak is checked/updated when a review session is completed

---

## Screens

### Home (`/`)
- Streak counter (🔥 N días)
- Count of entries due today
- "Repasar ahora →" button (visible only if items due > 0)
- "Todo al día ✓" message if nothing due
- Quick stats: total entries, total categories with entries

### Browse (`/browse`)
- Grid of category cards — each shows category name, emoji, and entry count
- Tap category → list of entries in that category (title + date added)
- Tap entry → full entry detail view (all 5 fields)
- Entry detail has Edit and Delete buttons

### Add (`/add`)
- Quick capture mode: only Title + Category required, shown prominently
- Expandable section "Añadir más detalle" reveals: Source, Connects to, Application
- On save → goes back to home with confirmation

### Review (`/review`)
- Entered from home "Repasar ahora" button
- Shows entries due today one section at a time, scrollable list
- Each entry card shows: title, why, source (if set), connects (if set), application (if set)
- Below each entry: 3 rating buttons (✅ 〜 ✗)
- Progress bar at top: "X / Y repasadas"
- On all rated → summary screen: "Repasaste X entradas 🎉" + streak update + back to home

### Search (`/search`)
- Search bar (autofocus)
- Real-time filter across: title, why, source, connects, application
- Results grouped by category
- Tap result → entry detail

---

## Data Layer (`src/lib/storage.ts`)

All operations go through a single module. localStorage key: `recall_data`.

Shape stored:
```ts
type Store = {
  entries: Entry[]
  categories: Category[]
  streak: { lastReviewDate: string; streak: number }
}

type Category = {
  id: string
  name: string
  emoji: string
  isDefault: boolean
}
```

Functions:
- `getStore(): Store` — reads and parses localStorage, seeds defaults on first run
- `saveStore(store: Store): void` — serializes and writes
- `addEntry(entry: Omit<Entry, 'id' | 'created_at' | 'next_review' | 'interval' | 'ease' | 'review_count'>): Entry`
- `updateEntry(id: string, patch: Partial<Entry>): void`
- `deleteEntry(id: string): void`
- `getDueEntries(): Entry[]` — entries where next_review <= today
- `rateEntry(id: string, rating: 'clear' | 'fuzzy' | 'blank'): void` — applies SR algorithm
- `updateStreak(): void` — called after completing a review session
- `addCategory(name: string, emoji: string): Category`
- `getCategories(): Category[]`

---

## File Structure

```
src/
  app/
    page.tsx              # Home
    browse/
      page.tsx            # Category grid
      [category]/
        page.tsx          # Entry list for category
    add/
      page.tsx            # Add entry form
    review/
      page.tsx            # Review session
    search/
      page.tsx            # Search
    entry/
      [id]/
        page.tsx          # Entry detail + edit
    layout.tsx            # Root layout with PWA meta + BottomNav
    globals.css
  components/
    BottomNav.tsx
    EntryCard.tsx         # Reusable entry display card
    RatingButtons.tsx     # ✅ 〜 ✗ buttons
    CategoryCard.tsx      # Category grid tile
  lib/
    storage.ts            # All localStorage operations
    sr.ts                 # Spaced repetition algorithm (pure functions)
    types.ts              # Entry, Category, Store types
```

---

## PWA Setup

Same approach as GoalTracker:
- `next.config.mjs` with `@ducanh2912/next-pwa`
- `public/manifest.json` with app name, icons, dark background
- Icons: 192×192, 512×512, apple-touch-icon
- `'use client'` + `export const dynamic = 'force-dynamic'` on data-fetching pages

---

## Out of Scope (v1)

- Sync across devices
- Photo/file attachments
- Links between entries (programmatic graph)
- Export/import JSON (can add in v2)
- Notifications/push reminders
