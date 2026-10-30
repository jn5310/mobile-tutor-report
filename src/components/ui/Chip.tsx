// 토글형 칩 컴포넌트 (FEAT-003)
// 탭하여 선택/해제하는 알약 모양 버튼. 타이핑을 최소화하기 위한 핵심 입력 수단입니다.

import { ReactNode } from 'react'

interface ChipProps {
  label: ReactNode
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
}

function Chip({ label, selected = false, onClick, disabled = false }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        'inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors',
        selected
          ? 'border-brand bg-brand text-white'
          : 'border-slate-300 bg-white text-slate-700 active:bg-slate-100',
        disabled ? 'opacity-50' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </button>
  )
}

export default Chip
