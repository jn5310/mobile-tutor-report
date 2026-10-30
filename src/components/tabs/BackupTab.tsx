// 데이터 백업 탭 (FEAT-004)
// 전체 데이터를 JSON 파일로 내보내고(백업), 백업 파일을 불러와(복구) 기기 변경에 대응합니다.
// 모든 데이터는 이 브라우저의 LocalStorage 에만 저장된다는 점을 안내합니다.

import { useRef, useState } from 'react'
import { Database, Download, Info, Sparkles, Upload } from 'lucide-react'
import { exportToJsonFile, importFromJsonFile } from '../../lib/backup'
import { replaceData } from '../../lib/storage'
import { generateSampleData } from '../../lib/sampleData'
import Button from '../ui/Button'
import Toast, { ToastState } from '../ui/Toast'
import { TabProps } from './types'

function BackupTab({ data, setData }: TabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  const notify = (message: string, kind: ToastState['kind'] = 'success') => {
    setToast({ message, kind })
  }

  const handleExport = () => {
    if (data.students.length === 0 && data.reports.length === 0) {
      notify('내보낼 데이터가 없습니다.', 'error')
      return
    }
    try {
      exportToJsonFile(data)
      notify('백업 파일을 내보냈습니다.')
    } catch {
      notify('내보내기에 실패했습니다.', 'error')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // 같은 파일을 다시 선택해도 onChange 가 발생하도록 값을 초기화합니다.
    e.target.value = ''
    if (!file) {
      return
    }
    try {
      const imported = await importFromJsonFile(file)
      const ok = window.confirm(
        `불러온 파일에 학생 ${imported.students.length}명, 리포트 ${imported.reports.length}건이 있습니다. 현재 데이터를 덮어쓸까요?`,
      )
      if (!ok) {
        notify('복구를 취소했습니다.', 'error')
        return
      }
      setData(replaceData(imported))
      notify('백업 데이터를 복구했습니다.')
    } catch (err) {
      notify(err instanceof Error ? err.message : '불러오기에 실패했습니다.', 'error')
    }
  }

  const handleLoadSample = () => {
    const ok = window.confirm(
      '샘플 데이터를 불러오면 현재 데이터를 덮어씁니다. 계속할까요?',
    )
    if (!ok) {
      return
    }
    setData(replaceData(generateSampleData()))
    notify('샘플 데이터를 불러왔습니다.')
  }

  return (
    <section className="px-4 py-4">
      <h2 className="mb-4 text-lg font-bold text-slate-900">데이터 백업</h2>

      <div className="flex flex-col gap-4">
        {/* 안내 */}
        <div className="flex items-start gap-2 rounded-2xl bg-brand/5 p-3 text-sm text-slate-600">
          <Info size={18} className="mt-0.5 shrink-0 text-brand" />
          <p>
            모든 데이터는 이 스마트폰(브라우저)의 저장소에만 보관됩니다. 기기를 바꾸거나 앱을 지우면
            데이터가 사라질 수 있으니, 주기적으로 JSON 파일로 내보내 백업해 주세요.
          </p>
        </div>

        {/* 현재 데이터 요약 */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-extrabold text-slate-900">{data.students.length}</p>
            <p className="text-xs text-slate-500">학생</p>
          </div>
          <div className="flex-1 rounded-2xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-extrabold text-slate-900">{data.reports.length}</p>
            <p className="text-xs text-slate-500">리포트</p>
          </div>
        </div>

        {/* 내보내기 */}
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-1 text-sm font-bold text-slate-900">전체 데이터 JSON 내보내기</h3>
          <p className="mb-3 text-xs text-slate-500">
            학생과 리포트 전체를 하나의 JSON 파일로 저장합니다.
          </p>
          <Button onClick={handleExport} size="lg" fullWidth>
            <Download size={18} />
            JSON 파일로 내보내기
          </Button>
        </div>

        {/* 불러오기 */}
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="mb-1 text-sm font-bold text-slate-900">백업 파일 불러오기</h3>
          <p className="mb-3 text-xs text-slate-500">
            내보낸 JSON 파일을 선택하면 현재 데이터를 덮어쓰고 복구합니다.
          </p>
          <Button onClick={handleImportClick} variant="secondary" size="lg" fullWidth>
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
        </div>

        {/* 샘플 데이터 */}
        <div className="rounded-2xl border border-dashed border-slate-300 p-4">
          <h3 className="mb-1 text-sm font-bold text-slate-900">샘플 데이터 불러오기</h3>
          <p className="mb-3 text-xs text-slate-500">
            기능을 바로 체험하고 싶다면 예시 학생과 리포트를 불러올 수 있습니다.
          </p>
          <Button onClick={handleLoadSample} variant="ghost" size="lg" fullWidth>
            <Sparkles size={18} />
            샘플 데이터 불러오기
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 py-2 text-slate-300">
          <Database size={16} />
          <span className="text-xs">LocalStorage 기반 저장</span>
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </section>
  )
}

export default BackupTab
