// 데이터 백업 탭 (FEAT-003 임시 자리표시자)
// FEAT-004 에서 JSON 내보내기/가져오기 기능으로 채워집니다.

import { Database } from 'lucide-react'
import { TabProps } from './types'

function BackupTab(_props: TabProps) {
  return (
    <section className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Database size={28} />
      </div>
      <h2 className="text-lg font-bold text-slate-900">데이터 백업</h2>
      <p className="text-sm text-slate-500">
        데이터 내보내기와 가져오기 기능이 곧 이곳에 추가됩니다.
      </p>
    </section>
  )
}

export default BackupTab
