// 별점 컴포넌트
// 1~5 사이를 탭으로 선택합니다. 각 별의 터치 영역은 44px 이상입니다.

import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  max?: number
  /** 점수별 짧은 설명. */
  labels?: string[]
}

const DEFAULT_LABELS = ['많이 흐트러짐', '아쉬움', '보통', '좋음', '아주 좋음']

function StarRating({ value, onChange, max = 5, labels = DEFAULT_LABELS }: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-between">
      <div className="-ml-1.5 flex items-center" role="radiogroup" aria-label="집중도 별점">
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
                size={28}
                strokeWidth={1.6}
                className={active ? 'text-[#C9922E]' : 'text-line'}
                fill={active ? 'currentColor' : 'none'}
              />
            </button>
          )
        })}
      </div>
      <span className="text-sm text-ink-soft">{labels[value - 1] ?? ''}</span>
    </div>
  )
}

export default StarRating
