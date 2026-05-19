import { Rating } from '@/lib/types'

type Props = { onRate: (r: Rating) => void; disabled?: boolean }

export default function RatingButtons({ onRate, disabled }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {([
        { rating: 'blank' as Rating,  label: '✗ No recordaba', cls: 'border-red-500/50 text-red-400' },
        { rating: 'fuzzy' as Rating,  label: '〜 Más o menos',  cls: 'border-yellow-500/50 text-yellow-400' },
        { rating: 'clear' as Rating,  label: '✓ Lo tenía claro', cls: 'border-green-500/50 text-green-400' },
      ]).map(({ rating, label, cls }) => (
        <button
          key={rating}
          onClick={() => onRate(rating)}
          disabled={disabled}
          className={`border rounded-xl py-3 text-[10px] font-bold tracking-wide text-center disabled:opacity-40 ${cls}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
