// 데이터 백업 탭
// 선생님 정보(리포트 서명) 설정, 전체 데이터 JSON 내보내기(백업)/불러오기(복구),
// 샘플 데이터 불러오기, 전체 삭제를 담습니다.

import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { exportToJsonFile, importFromJsonFile } from '../../lib/backup'
import { clearData, replaceData, updateSettings } from '../../lib/storage'
import { generateSampleData } from '../../lib/sampleData'
import { createEmptyAppData } from '../../types'
import Button from '../ui/Button'
import Toast, { ToastState } from '../ui/Toast'
import { TabProps } from './types'

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

function BackupTab({ data, setData }: TabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [teacherName, setTeacherName] = useState(data.settings?.teacherName ?? '')
  const [academyName, setAcademyName] = useState(data.settings?.academyName ?? '')

  const notify = (message: string, kind: ToastState['kind'] = 'success') => setToast({ message, kind })

  const settingsDirty =
    teacherName.trim() !== (data.settings?.teacherName ?? '') ||
    academyName.trim() !== (data.settings?.academyName ?? '')

  const saveSettings = () => {
    setData(updateSettings(data, { teacherName: teacherName.trim(), academyName: academyName.trim() }))
    notify('선생님 정보를 저장했습니다.')
  }

  const lastBackup = data.settings?.lastBackupAt
  const backupAge = lastBackup ? daysSince(lastBackup) : null
  const needsBackup = data.reports.length > 0 && (backupAge === null || backupAge >= 14)

  const handleExport = () => {
    if (data.students.length === 0 && data.reports.length === 0) {
      notify('내보낼 데이터가 없습니다.', 'error')
      return
    }
    try {
      const next = updateSettings(data, { lastBackupAt: new Date().toISOString() })
      exportToJsonFile(next)
      setData(next)
      notify('백업 파일을 저장했습니다. 카카오톡 나에게 보내기나 드라이브에 올려 두세요.')
    } catch {
      notify('내보내기에 실패했습니다.', 'error')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) {
      return
    }
    try {
      const imported = await importFromJsonFile(file)
      const ok = window.confirm(
        `백업 파일에 학생 ${imported.students.length}명, 리포트 ${imported.reports.length}건이 있습니다.\n지금 이 폰에 있는 데이터를 이 파일 내용으로 바꿀까요?`,
      )
      if (!ok) {
        return
      }
      const restored = replaceData(imported)
      setData(restored)
      setTeacherName(restored.settings?.teacherName ?? '')
      setAcademyName(restored.settings?.academyName ?? '')
      notify('백업 데이터를 복구했습니다.')
    } catch (err) {
      notify(err instanceof Error ? err.message : '불러오기에 실패했습니다.', 'error')
    }
  }

  const handleLoadSample = () => {
    if (data.students.length > 0 && !window.confirm('지금 데이터를 지우고 샘플 데이터로 바꿉니다. 계속할까요?')) {
      return
    }
    setData(replaceData({ ...generateSampleData(), settings: data.settings }))
    notify('샘플 데이터를 불러왔습니다.')
  }

  const handleClear = () => {
    if (!window.confirm(`학생 ${data.students.length}명과 리포트 ${data.reports.length}건을 모두 지웁니다.\n백업 파일이 없다면 되돌릴 수 없습니다. 계속할까요?`)) {
      return
    }
    clearData()
    setData(replaceData({ ...createEmptyAppData(), settings: data.settings }))
    notify('모든 학생과 리포트를 지웠습니다.')
  }

  return (
    <div className="pb-4">
      <div className="px-4 pb-4 pt-5">
        <h2 className="text-[22px] font-bold text-ink">데이터 백업</h2>
        <p className="mt-0.5 text-sm text-ink-soft">
          학생 {data.students.length}명 · 리포트 {data.reports.length}건이 이 폰에 저장되어 있습니다
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <section className="sheet">
          <div className="section-label">
            <span className="text-[15px]">선생님 정보</span>
          </div>
          <p className="-mt-1 mb-4 text-[13px] leading-relaxed text-ink-soft">
            리포트 카드 아래와 카카오톡 글 끝에 서명으로 들어갑니다.
          </p>
          <label className="field-label" htmlFor="teacher-name">
            이름
          </label>
          <input
            id="teacher-name"
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            placeholder="예: 김민지"
            autoComplete="name"
            className="text-input mb-4"
          />
          <label className="field-label" htmlFor="academy-name">
            학원/과외 이름 <span className="text-ink-mute">(선택)</span>
          </label>
          <input
            id="academy-name"
            type="text"
            value={academyName}
            onChange={(e) => setAcademyName(e.target.value)}
            placeholder="예: 민지쌤 국어"
            autoComplete="organization"
            className="text-input mb-4"
          />
          <Button onClick={saveSettings} variant="secondary" fullWidth disabled={!settingsDirty}>
            {settingsDirty ? '저장' : '저장됨'}
          </Button>
        </section>

        <section className="sheet">
          <div className="section-label justify-between">
            <span className="text-[15px]">백업 파일 만들기</span>
            <span className={['text-[13px] font-normal', needsBackup ? 'text-kor' : 'text-ink-mute'].join(' ')}>
              {backupAge === null ? '아직 백업한 적 없음' : backupAge === 0 ? '오늘 백업함' : `${backupAge}일 전 백업`}
            </span>
          </div>
          <p className="-mt-1 mb-4 text-[13px] leading-relaxed text-ink-soft">
            학생과 리포트 전체를 JSON 파일 하나로 저장합니다. 폰을 바꾸거나 브라우저 데이터를 지우기 전에 꼭 만들어 두세요.
          </p>
          <Button onClick={handleExport} size="lg" fullWidth>
            <Download size={18} />
            JSON 파일로 내보내기
          </Button>
        </section>

        <section className="sheet">
          <div className="section-label">
            <span className="text-[15px]">백업 파일로 복구하기</span>
          </div>
          <p className="-mt-1 mb-4 text-[13px] leading-relaxed text-ink-soft">
            내보낸 JSON 파일을 고르면 지금 데이터를 그 파일 내용으로 바꿉니다.
          </p>
          <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="lg" fullWidth>
            <Upload size={18} />
            백업 파일 선택
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </section>

        <section className="px-4 pt-2">
          <h3 className="mb-2 text-[13px] font-semibold text-ink-soft">알아 두세요</h3>
          <ul className="list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-ink-soft">
            <li>데이터는 서버가 아니라 이 폰의 브라우저 안에만 저장됩니다. 다른 사람은 볼 수 없습니다.</li>
            <li>
              아이폰은 사파리에서 쓰던 데이터와 홈 화면에 추가한 앱의 데이터가 서로 따로 저장됩니다. 사파리에서 먼저 써 봤다면
              백업 파일을 만든 뒤 홈 화면 앱에서 복구해 주세요.
            </li>
            <li>브라우저의 방문 기록·사이트 데이터를 지우면 리포트도 함께 지워집니다.</li>
          </ul>
        </section>

        <section className="flex flex-col items-start gap-1 px-4 pt-4">
          <button
            type="button"
            onClick={handleLoadSample}
            className="min-h-[44px] text-sm text-ink-soft underline underline-offset-4"
          >
            샘플 데이터 불러오기
          </button>
          {(data.students.length > 0 || data.reports.length > 0) && (
            <button
              type="button"
              onClick={handleClear}
              className="min-h-[44px] text-sm text-kor underline underline-offset-4"
            >
              모든 학생과 리포트 지우기
            </button>
          )}
        </section>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

export default BackupTab
