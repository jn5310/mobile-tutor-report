// 점수 입력 컴포넌트
// 0점에서 88점까지 +1 을 88번 누르지 않도록, 10점 단위 버튼으로 먼저 고르고
// +/- 버튼으로 1점, 5점씩 다듬습니다. 자판은 쓰지 않습니다.

interface ScoreInputProps {
  value: number
  onChange: (value: number) => void
  /** 직전 회차 점수. 있으면 변화량을 옆에 표시합니다. */
  previous?: number
  /** 과목 색. */
  tone?: 'kor' | 'math'
}

const TENS = [40, 50, 60, 70, 80, 90, 100] as const
const NUDGES = [-5, -1, 1, 5] as const

function clamp(v: number): number {
  return Math.min(100, Math.max(0, v))
}

function ScoreInput({ value, onChange, previous, tone = 'kor' }: ScoreInputProps) {
  const diff = typeof previous === 'number' ? value - previous : null
  const accent = tone === 'kor' ? 'text-kor' : 'text-math'
  const tensBase = Math.floor(value / 10) * 10

  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <div className={`tabular text-[40px] font-bold leading-none ${accent}`}>
          {value}
          <span className="ml-0.5 text-lg font-semibold text-ink-soft">점</span>
        </div>
        {diff !== null && (
          <div className="text-right text-sm text-ink-soft">
            <div>지난번 {previous}점</div>
            <div
              className={[
                'tabular font-semibold',
                diff > 0 ? 'text-brand' : diff < 0 ? 'text-kor' : 'text-ink-mute',
              ].join(' ')}
            >
              {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '변동 없음'}
            </div>
          </div>
        )}
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {TENS.map((t) => {
          const active = tensBase === t || (t === 100 && value === 100)
          return (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              aria-label={`${t}점`}
              className={[
                'tabular min-h-[44px] rounded border text-sm transition-colors',
                active
                  ? 'border-ink bg-ink font-semibold text-paper'
                  : 'border-line bg-white text-ink active:bg-paper',
              ].join(' ')}
            >
              {t}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-4 gap-1">
        {NUDGES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(clamp(value + n))}
            aria-label={n > 0 ? `${n}점 올리기` : `${-n}점 내리기`}
            className="tabular min-h-[44px] rounded border border-line bg-white text-[15px] text-ink active:bg-paper"
          >
            {n > 0 ? `+${n}` : `−${-n}`}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-start">
        <button
          type="button"
          onClick={() => onChange(0)}
          className="min-h-[44px] px-1 text-sm text-ink-mute underline underline-offset-4"
        >
          0점으로
        </button>
      </div>
    </div>
  )
}

export default ScoreInput
