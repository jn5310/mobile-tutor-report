// 스텝퍼 컴포넌트 (FEAT-003)
// +/- 버튼으로 숫자 값을 조정합니다. 각 버튼은 44px 이상입니다.

import { Minus, Plus } from 'lucide-react'

interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function Stepper({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix,
}: StepperProps) {
  const dec = () => onChange(clamp(value - step, min, max))
  const inc = () => onChange(clamp(value + step, min, max))

  return (
    <div className="inline-flex items-stretch overflow-hidden rounded-xl border border-slate-300">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="감소"
        className="flex h-11 w-11 items-center justify-center bg-slate-100 text-slate-700 active:bg-slate-200 disabled:opacity-40"
      >
        <Minus size={18} />
      </button>
      <div className="flex h-11 min-w-[72px] items-center justify-center px-3 text-base font-semibold text-slate-900">
        {value}
        {suffix}
      </div>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="증가"
        className="flex h-11 w-11 items-center justify-center bg-slate-100 text-slate-700 active:bg-slate-200 disabled:opacity-40"
      >
        <Plus size={18} />
      </button>
    </div>
  )
}

export default Stepper
