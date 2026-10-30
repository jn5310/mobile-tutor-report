// 히스토리 탭 (FEAT-003 임시 자리표시자)
// FEAT-004 에서 학생별 리포트 히스토리와 점수 추이 차트로 채워집니다.

import { Clock } from 'lucide-react'
import { TabProps } from './types'

function HistoryTab(_props: TabProps) {
  return (
    <section className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Clock size={28} />
      </div>
      <h2 className="text-lg font-bold text-slate-900">히스토리</h2>
      <p className="text-sm text-slate-500">
        학생별 지난 리포트와 점수 추이가 곧 이곳에 표시됩니다.
      </p>
    </section>
  )
}

export default HistoryTab
