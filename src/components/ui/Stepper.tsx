// 스텝퍼 컴포넌트
// +/- 버튼으로 숫자 값을 조정합니다. 각 버튼은 44px 이상입니다.

import { Minus, Plus } from 'lucide-react'

interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  label?: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function Stepper({ value, onChange, min = 0, max = 100, step = 1, suffix, label }: StepperProps) {
  const dec = () => onChange(clamp(value - step, min, max))
  const inc = () => onChange(clamp(value + step, min, max))

  return (
    <div className="inline-flex items-stretch overflow-hidden rounded border border-line bg-white">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label={label ? `${label} 줄이기` : '감소'}
        className="flex h-11 w-11 items-center justify-center text-ink active:bg-paper disabled:text-line"
      >
        <Minus size={18} />
      </button>
      <div className="tabular flex h-11 min-w-[52px] items-center justify-center border-x border-line px-2 text-base font-semibold text-ink">
        {value}
        {suffix}
      </div>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label={label ? `${label} 늘리기` : '증가'}
        className="flex h-11 w-11 items-center justify-center text-ink active:bg-paper disabled:text-line"
      >
        <Plus size={18} />
      </button>
    </div>
  )
}

export default Stepper
