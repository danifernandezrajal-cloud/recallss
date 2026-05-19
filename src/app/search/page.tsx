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
          <div className="text-center text-subtle py-8 text-sm">Sin resultados para &ldquo;{query}&rdquo;</div>
        )}
      </div>
    </div>
  )
}
