// 별점 컴포넌트 (FEAT-003)
// 1~5 사이를 탭으로 선택합니다. 각 별의 터치 영역은 44px 이상입니다.

import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1)
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="집중도 별점">
      {stars.map((n) => {
        const active = n <= value
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n}점`}
            aria-checked={value === n}
            role="radio"
            className="flex h-11 w-11 items-center justify-center"
          >
            <Star
              size={30}
              className={active ? 'text-amber-400' : 'text-slate-300'}
              fill={active ? 'currentColor' : 'none'}
            />
          </button>
        )
      })}
    </div>
  )
}

export default StarRating
