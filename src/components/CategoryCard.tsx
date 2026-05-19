import Link from 'next/link'
import { Category } from '@/lib/types'

type Props = { category: Category; count: number }

export default function CategoryCard({ category, count }: Props) {
  return (
    <Link href={`/browse/${encodeURIComponent(category.name)}`}>
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2 active:opacity-70">
        <div className="text-3xl">{category.emoji}</div>
        <div className="text-white font-bold text-sm leading-tight">{category.name}</div>
        <div className="text-[10px] tracking-widest text-subtle">{count} {count === 1 ? 'entrada' : 'entradas'}</div>
      </div>
    </Link>
  )
}
