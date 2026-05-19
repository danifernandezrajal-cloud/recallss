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
