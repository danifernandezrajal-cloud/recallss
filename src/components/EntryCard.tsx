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
