// 토글형 칩 컴포넌트
// 탭하여 선택/해제합니다. 타이핑을 줄이기 위한 핵심 입력 수단입니다.

import { ReactNode } from 'react'

export type ChipTone = 'default' | 'kor' | 'math'

interface ChipProps {
  label: ReactNode
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  /** 선택됐을 때의 색. 국어/수학 화면에서 과목 색을 씁니다. */
  tone?: ChipTone
  /** 오른쪽에 붙는 작은 보조 표시 (예: 문항 수). */
  badge?: ReactNode
}

const selectedClasses: Record<ChipTone, string> = {
  default: 'border-ink bg-ink text-paper',
  kor: 'border-kor bg-kor text-white',
  math: 'border-math bg-math text-white',
}

function Chip({
  label,
  selected = false,
  onClick,
  disabled = false,
  tone = 'default',
  badge,
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded border px-3.5 text-[15px] transition-colors',
        selected
          ? `${selectedClasses[tone]} font-semibold`
          : 'border-line bg-white text-ink active:bg-paper',
        disabled ? 'opacity-40' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
      {badge !== undefined && badge !== null && (
        <span className="tabular text-[13px] opacity-80">{badge}</span>
      )}
    </button>
  )
}

export default Chip
