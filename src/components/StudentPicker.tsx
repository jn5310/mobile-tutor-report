// 가로로 넘겨 고르는 학생 선택 줄. 리포트 작성/히스토리 탭에서 함께 씁니다.

import { Student } from '../types'
import SubjectTag from './ui/SubjectTag'

interface StudentPickerProps {
  students: Student[]
  value: string | null
  onChange: (id: string) => void
  /** true 면 선택된 학생 말고는 누를 수 없습니다 (리포트 수정 중). */
  locked?: boolean
}

function StudentPicker({ students, value, onChange, locked = false }: StudentPickerProps) {
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-4">
      {students.map((s) => {
        const active = s.id === value
        const disabled = locked && !active
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => !disabled && onChange(s.id)}
            disabled={disabled}
            aria-pressed={active}
            className={[
              'flex min-h-[48px] shrink-0 items-center gap-2 rounded border px-3 transition-colors',
              active ? 'border-ink bg-white' : 'border-line bg-transparent text-ink-soft active:bg-white',
              disabled ? 'opacity-40' : '',
            ].join(' ')}
          >
            <span className={['text-[15px]', active ? 'font-bold text-ink' : ''].join(' ')}>{s.name}</span>
            <SubjectTag subject={s.subjects} />
          </button>
        )
      })}
    </div>
  )
}

export default StudentPicker
