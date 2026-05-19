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
        <Link href="/browse" className="text-subtle text-sm">←</Link>
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
