// 하단 고정 탭바
// 4개 탭: 학생 관리 / 리포트 작성 / 히스토리 / 데이터 백업.

import { FolderClock, HardDriveDownload, NotebookPen, UsersRound } from 'lucide-react'

export type TabKey = 'students' | 'report' | 'history' | 'backup'

interface TabDef {
  key: TabKey
  label: string
  Icon: typeof UsersRound
}

const TABS: TabDef[] = [
  { key: 'students', label: '학생 관리', Icon: UsersRound },
  { key: 'report', label: '리포트 작성', Icon: NotebookPen },
  { key: 'history', label: '히스토리', Icon: FolderClock },
  { key: 'backup', label: '데이터 백업', Icon: HardDriveDownload },
]

interface TabBarProps {
  active: TabKey
  onChange: (key: TabKey) => void
}

function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-line bg-paper/95 pb-safe backdrop-blur">
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
                  'relative flex min-h-[60px] w-full flex-col items-center justify-center gap-1 pb-1.5 pt-2 text-[12px] transition-colors',
                  isActive ? 'font-semibold text-ink' : 'text-ink-mute active:text-ink-soft',
                ].join(' ')}
              >
                {isActive && <span className="absolute inset-x-6 top-0 h-[2px] bg-ink" />}
                <Icon size={22} strokeWidth={isActive ? 2 : 1.6} />
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
