// 앱 셸
// max-w-md mx-auto min-h-screen 모바일 컨테이너 + 상단 헤더 + 콘텐츠 + 하단 고정 탭바.
// AppData 와 '지금 보고 있는 학생'을 이곳에서 들고 각 탭에 내려 줍니다.

import { useCallback, useEffect, useState } from 'react'
import { AppData } from './types'
import { loadData, requestPersistentStorage } from './lib/storage'
import TabBar, { TabKey } from './components/TabBar'
import StudentsTab from './components/tabs/StudentsTab'
import ReportBuilderTab from './components/tabs/ReportBuilderTab'
import HistoryTab from './components/tabs/HistoryTab'
import BackupTab from './components/tabs/BackupTab'
import { TabProps } from './components/tabs/types'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function todayLabel(): string {
  const d = new Date()
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일`
}

function App() {
  // 첫 렌더부터 저장된 데이터를 쓰도록 지연 초기화합니다.
  const [data, setData] = useState<AppData>(loadData)
  const [active, setActive] = useState<TabKey>('students')
  const [studentId, setStudentId] = useState<string | null>(
    () => loadData().students[0]?.id ?? null,
  )

  const [editReportId, setEditReportId] = useState<string | null>(null)

  useEffect(() => {
    void requestPersistentStorage()
  }, [])

  // 선택된 학생이 삭제되었거나 아직 없으면 첫 번째 학생으로 맞춥니다.
  useEffect(() => {
    if (!studentId || !data.students.some((s) => s.id === studentId)) {
      setStudentId(data.students[0]?.id ?? null)
    }
  }, [data.students, studentId])

  const goTo = useCallback((tab: TabKey, id?: string) => {
    if (id) {
      setStudentId(id)
    }
    setActive(tab)
    window.scrollTo({ top: 0 })
  }, [])

  const changeTab = (tab: TabKey) => {
    setActive(tab)
    window.scrollTo({ top: 0 })
  }

  const tabProps: TabProps = {
    data,
    setData,
    studentId,
    setStudentId,
    goTo,
    editReportId,
    setEditReportId,
  }
  const teacher = data.settings?.teacherName?.trim()

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="pt-safe sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <h1 className="text-[17px] font-bold tracking-tight text-ink">수업 리포트</h1>
          <p className="text-[13px] text-ink-soft">
            {teacher ? `${teacher} 선생님 · ` : ''}
            {todayLabel()}
          </p>
        </div>
      </header>

      {/* 하단 탭바(약 60px + 안전영역)를 가리지 않도록 넉넉한 하단 여백 */}
      <main className="flex-1 pb-28">
        {active === 'students' && <StudentsTab {...tabProps} />}
        {/* 작성 중인 내용이 탭 이동으로 사라지지 않도록 리포트 작성 탭은 항상 마운트해 둡니다. */}
        <div hidden={active !== 'report'}>
          <ReportBuilderTab {...tabProps} />
        </div>
        {active === 'history' && <HistoryTab {...tabProps} />}
        {active === 'backup' && <BackupTab {...tabProps} />}
      </main>

      <TabBar active={active} onChange={changeTab} />
    </div>
  )
}

export default App
