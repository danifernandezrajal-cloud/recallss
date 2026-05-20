'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getStore } from '@/lib/storage'
import { Entry } from '@/lib/types'

export default function RandomPage() {
  const router = useRouter()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [total, setTotal] = useState(0)
  const [mounted, setMounted] = useState(false)

  const pickRandom = useCallback((exclude?: string) => {
    const store = getStore()
    const pool = store.entries.filter(e => e.id !== exclude)
    if (pool.length === 0) {
      setEntry(store.entries[0] ?? null)
    } else {
      setEntry(pool[Math.floor(Math.random() * pool.length)])
    }
    setTotal(store.entries.length)
  }, [])

  useEffect(() => {
    pickRandom()
    setMounted(true)
  }, [pickRandom])

  if (!mounted || !entry) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <div className="text-subtle text-sm">No hay entradas todavía</div>
        <button onClick={() => router.push('/add')} className="text-accent text-sm tracking-widest">+ AÑADIR PRIMERA ENTRADA</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="px-5 pt-5 pb-3 border-b border-border flex justify-between items-start">
        <div>
          <button onClick={() => router.back()} className="text-subtle text-sm mb-1 block">←</button>
          <div className="text-[11px] tracking-widest text-subtle uppercase mb-1">Sorpresa</div>
          <div className="text-[22px] font-bold">🎲 Aleatoria</div>
        </div>
        <div className="text-[10px] tracking-widest text-subtle mt-6">{total} entradas</div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        <div className="text-[9px] tracking-widest text-subtle">{entry.category}</div>
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

        <div className="text-[10px] text-subtle text-center pt-1">
          Repasos: {entry.review_count} · Guardado: {new Date(entry.created_at).toLocaleDateString('es-ES')}
        </div>

        <button
          onClick={() => pickRandom(entry.id)}
          className="w-full bg-accent text-white font-bold py-4 rounded-xl text-sm tracking-widest mt-2"
        >
          OTRA ENTRADA →
        </button>

        <button
          onClick={() => router.push(`/entry/${entry.id}`)}
          className="w-full border border-border text-subtle font-bold py-3 rounded-xl text-sm tracking-widest"
        >
          VER COMPLETA
        </button>
      </div>
    </div>
  )
}
