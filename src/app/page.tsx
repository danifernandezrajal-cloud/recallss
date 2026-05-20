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
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-widest text-subtle mb-1">RACHA</div>
            <div className="text-2xl font-extrabold text-accent">{streak} días</div>
          </div>
          <div className="text-4xl">🔥</div>
        </div>

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

        <Link href="/random">
          <div className="border border-accent rounded-xl p-4 text-center">
            <div className="text-accent font-bold text-sm tracking-widest">SORPRÉNDEME →</div>
            <div className="text-subtle text-xs mt-1">Repasa una entrada aleatoria</div>
          </div>
        </Link>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="text-[10px] tracking-widest text-subtle mb-3">BIBLIOTECA</div>
          <div className="text-2xl font-extrabold text-white">{total} <span className="text-sm font-normal text-subtle">entradas guardadas</span></div>
        </div>
      </div>
    </div>
  )
}
