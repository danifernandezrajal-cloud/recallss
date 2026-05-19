'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { getStore, addCategory } from '@/lib/storage'
import { Category, Entry } from '@/lib/types'
import CategoryCard from '@/components/CategoryCard'

export default function BrowsePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [mounted, setMounted] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('')

  useEffect(() => {
    const store = getStore()
    setCategories(store.categories)
    setEntries(store.entries)
    setMounted(true)
  }, [])

  function handleAddCategory() {
    if (!newName.trim() || !newEmoji.trim()) return
    const cat = addCategory(newName.trim(), newEmoji.trim())
    setCategories(prev => [...prev, cat])
    setNewName('')
    setNewEmoji('')
    setAdding(false)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <div className="text-[11px] tracking-widest text-subtle uppercase mb-1">Biblioteca</div>
        <div className="text-[22px] font-bold">📚 Browse</div>
      </div>
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          {categories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              count={entries.filter(e => e.category === cat.name).length}
            />
          ))}
        </div>
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
      </div>
    </div>
  )
}
