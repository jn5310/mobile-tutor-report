// 탭 공용 props 형태

import { AppData } from '../../types'
import type { TabKey } from '../TabBar'

export interface TabProps {
  data: AppData
  setData: (next: AppData) => void
  /** 탭 사이에서 함께 쓰는 '지금 보고 있는 학생'. */
  studentId: string | null
  setStudentId: (id: string | null) => void
  /** 다른 탭으로 이동합니다. studentId 를 주면 그 학생을 선택한 채로 엽니다. */
  goTo: (tab: TabKey, studentId?: string) => void
  /** 히스토리에서 '수정'을 누른 리포트 id. 리포트 작성 탭이 이 값을 받아 폼을 채웁니다. */
  editReportId: string | null
  setEditReportId: (id: string | null) => void
}
