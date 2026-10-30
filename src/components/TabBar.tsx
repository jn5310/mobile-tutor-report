// 하단 고정 탭바 (FEAT-003)
// max-w-md 컨테이너 안에서 화면 하단에 고정되며, 안전 영역 패딩을 적용합니다.
// 4개 탭: 학생 관리 / 리포트 작성 / 히스토리 / 데이터 백업.

import { Clock, Database, PenLine, Users } from 'lucide-react'

export type TabKey = 'students' | 'report' | 'history' | 'backup'

interface TabDef {
  key: TabKey
  label: string
  Icon: typeof Users
}

const TABS: TabDef[] = [
  { key: 'students', label: '학생 관리', Icon: Users },
  { key: 'report', label: '리포트 작성', Icon: PenLine },
  { key: 'history', label: '히스토리', Icon: Clock },
  { key: 'backup', label: '데이터 백업', Icon: Database },
]

interface TabBarProps {
  active: TabKey
  onChange: (key: TabKey) => void
}

function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-slate-200 bg-white pb-safe">
      <ul className="flex">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = key === active
          return (
            <li key={key} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(key)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex min-h-[56px] w-full flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
                  isActive ? 'text-brand' : 'text-slate-400 active:text-slate-600',
                ].join(' ')}
              >
                <Icon size={22} />
                <span>{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default TabBar
