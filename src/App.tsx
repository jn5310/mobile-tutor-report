// 앱 셸 (FEAT-003)
// max-w-md mx-auto min-h-screen 모바일 컨테이너 + 상단 헤더 + 스크롤 콘텐츠 + 하단 고정 탭바.
// AppData 상태를 이곳으로 끌어올려 각 탭에 data/setData 를 내려줍니다.

import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { AppData } from './types'
import { createEmptyAppData } from './types'
import { loadData } from './lib/storage'
import TabBar, { TabKey } from './components/TabBar'
import StudentsTab from './components/tabs/StudentsTab'
import ReportBuilderTab from './components/tabs/ReportBuilderTab'
import HistoryTab from './components/tabs/HistoryTab'
import BackupTab from './components/tabs/BackupTab'

function App() {
  const [data, setData] = useState<AppData>(createEmptyAppData)
  const [active, setActive] = useState<TabKey>('students')

  // 마운트 시 로컬 스토리지에서 데이터를 불러옵니다.
  useEffect(() => {
    setData(loadData())
  }, [])

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
          <BookOpen size={20} />
        </div>
        <h1 className="text-base font-bold text-slate-900">과외 리포트 생성기</h1>
      </header>

      {/* 하단 탭바(약 72px + 안전영역)를 가리지 않도록 넉넉한 하단 여백 */}
      <main className="flex-1 overflow-y-auto pb-28">
        {active === 'students' && <StudentsTab data={data} setData={setData} />}
        {active === 'report' && <ReportBuilderTab data={data} setData={setData} />}
        {active === 'history' && <HistoryTab data={data} setData={setData} />}
        {active === 'backup' && <BackupTab data={data} setData={setData} />}
      </main>

      <TabBar active={active} onChange={setActive} />
    </div>
  )
}

export default App
