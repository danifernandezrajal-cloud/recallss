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
    setRated(prev => new Set(Array.from(prev).concat(entry.id)))
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
          <button onClick={handleFinish} className="w-full bg-accent text-white font-bold py-4 rounded-xl text-sm tracking-widest mt-2">
            TERMINAR SESIÓN 🎉
          </button>
        )}
      </div>
    </div>
  )
}
