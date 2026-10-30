// 세그먼트 컨트롤 컴포넌트 (FEAT-003)
// 상/중/하, 과목 선택 등 상호 배타적 선택에 사용합니다. 높이 44px 이상.

interface SegmentedProps<T extends string> {
  options: readonly T[]
  value: T | null
  onChange: (value: T) => void
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className="inline-flex w-full rounded-xl bg-slate-100 p-1" role="tablist">
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt)}
            className={[
              'flex min-h-[44px] flex-1 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors',
              active
                ? 'bg-white text-brand shadow-sm'
                : 'text-slate-500 active:text-slate-700',
            ].join(' ')}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

export default Segmented
