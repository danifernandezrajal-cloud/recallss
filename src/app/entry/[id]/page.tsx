'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getStore, updateEntry, deleteEntry, getCategories } from '@/lib/storage'
import { Entry, Category } from '@/lib/types'

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
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

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
      setCategory(found.category)
    }
    setCategories(getCategories())
  }, [params.id])

  function handleSave() {
    if (!entry) return
    updateEntry(entry.id, {
      title: title.trim(),
      why: why.trim(),
      source: source.trim() || undefined,
      connects: connects.trim() || undefined,
      application: application.trim() || undefined,
      category,
    })
    setEntry({ ...entry, title, why, source: source || undefined, connects: connects || undefined, application: application || undefined, category })
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
            {([
              { label: '🧩 IDEA', value: title, set: setTitle, rows: 1 },
              { label: '🧠 POR QUÉ IMPORTA', value: why, set: setWhy, rows: 3 },
              { label: '📍 FUENTE', value: source, set: setSource, rows: 1 },
              { label: '🔗 CONECTA CON', value: connects, set: setConnects, rows: 1 },
              { label: '⚡ APLICACIÓN REAL', value: application, set: setApplication, rows: 2 },
            ] as Array<{ label: string; value: string; set: (v: string) => void; rows: number }>).map(({ label, value, set, rows }) => (
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
            <div>
              <label className="text-[9px] tracking-widest text-subtle block mb-1">CATEGORÍA</label>
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
                <div className="text-white text-sm whitespace-pre-wrap">{value}</div>
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
