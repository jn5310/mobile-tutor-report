// 탭 공용 props 형태 (FEAT-003)
// 모든 탭은 동일한 데이터/갱신 props 를 받아 FEAT-004 에서 손쉽게 확장할 수 있습니다.

import { AppData } from '../../types'

export interface TabProps {
  data: AppData
  setData: (next: AppData) => void
}
