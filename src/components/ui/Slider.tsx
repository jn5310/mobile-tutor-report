// 슬라이더 컴포넌트
// 큼직한 썸을 가진 range 입력. 채워진 구간을 색으로 보여 줍니다.

import { CSSProperties } from 'react'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
}

function Slider({ value, onChange, min = 0, max = 100, step = 5, label = '값 조절' }: SliderProps) {
  const fill = ((value - min) / (max - min)) * 100
  return (
    <input
      type="range"
      className="mtr-slider"
      style={{ '--fill': `${fill}%` } as CSSProperties}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={label}
    />
  )
}

export default Slider
