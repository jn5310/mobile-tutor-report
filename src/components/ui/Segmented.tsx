// 세그먼트 컨트롤 컴포넌트
// 상/중/하, 과목 선택 등 하나만 고르는 입력에 씁니다. 높이 44px 이상.

import { ReactNode } from 'react'

interface SegmentedProps<T extends string> {
  options: readonly T[]
  value: T | null
  onChange: (value: T) => void
  /** 옵션 아래 작은 설명 (예: 상 -> '응용 가능'). */
  hints?: Partial<Record<T, ReactNode>>
}

function Segmented<T extends string>({ options, value, onChange, hints }: SegmentedProps<T>) {
  return (
    <div className="flex w-full overflow-hidden rounded border border-line bg-white" role="radiogroup">
      {options.map((opt, i) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={[
              'flex min-h-[48px] flex-1 flex-col items-center justify-center px-2 py-1.5 transition-colors',
              i > 0 ? 'border-l border-line' : '',
              active ? 'bg-ink text-paper' : 'text-ink active:bg-paper',
            ].join(' ')}
          >
            <span className={['text-[15px]', active ? 'font-semibold' : ''].join(' ')}>{opt}</span>
            {hints?.[opt] && (
              <span className={['text-2xs', active ? 'text-paper/70' : 'text-ink-mute'].join(' ')}>
                {hints[opt]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default Segmented
