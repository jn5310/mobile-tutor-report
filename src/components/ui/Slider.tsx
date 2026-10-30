// 슬라이더 컴포넌트 (FEAT-003)
// 큼직한 썸을 가진 range 입력. 현재 값을 % 로 표시합니다.

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  showPercent?: boolean
}

function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 5,
  showPercent = true,
}: SliderProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        className="mtr-slider flex-1"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="값 조절 슬라이더"
      />
      <span className="w-14 shrink-0 text-right text-sm font-semibold text-slate-900">
        {value}
        {showPercent ? '%' : ''}
      </span>
    </div>
  )
}

export default Slider
