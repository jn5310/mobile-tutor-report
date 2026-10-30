// 리포트 미리보기 모달 (FEAT-004)
// ReportCard 와 공유 액션 버튼(카카오톡 텍스트 복사 / 이미지 공유 / PNG 다운로드)을 담습니다.
// 리포트 작성 저장 후, 그리고 히스토리 탭에서 열 수 있습니다.

import { useRef, useState } from 'react'
import { Copy, Download, Share2, X } from 'lucide-react'
import { AppData, Report, Student } from '../../types'
import {
  copyToClipboard,
  downloadPng,
  exportCardToPng,
  isWebShareSupported,
  shareCardImage,
  toKakaoText,
} from '../../lib/share'
import Button from '../ui/Button'
import Toast, { ToastState } from '../ui/Toast'
import ReportCard from './ReportCard'

interface ReportPreviewProps {
  data: AppData
  report: Report
  student: Student
  onClose: () => void
}

/** 안전한 PNG 파일명을 만듭니다. */
function pngFileName(student: Student, report: Report): string {
  const safeName = student.name.replace(/\s+/g, '')
  return `리포트_${safeName}_${report.date}.png`
}

function ReportPreview({ data, report, student, onClose }: ReportPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [busy, setBusy] = useState<boolean>(false)
  const shareSupported = isWebShareSupported()

  const notify = (message: string, kind: ToastState['kind'] = 'success') => {
    setToast({ message, kind })
  }

  const handleCopyText = async () => {
    try {
      await copyToClipboard(toKakaoText(report, student))
      notify('카카오톡 메시지를 복사했습니다. 복사됨!')
    } catch (err) {
      notify(err instanceof Error ? err.message : '복사에 실패했습니다.', 'error')
    }
  }

  const handleShareImage = async () => {
    if (!cardRef.current) {
      return
    }
    setBusy(true)
    try {
      const blob = await exportCardToPng(cardRef.current)
      await shareCardImage(blob, pngFileName(student, report))
      notify('공유창을 열었습니다.')
    } catch (err) {
      notify(err instanceof Error ? err.message : '공유에 실패했습니다.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current) {
      return
    }
    setBusy(true)
    try {
      const blob = await exportCardToPng(cardRef.current)
      downloadPng(blob, pngFileName(student, report))
      notify('PNG 이미지를 저장했습니다.')
    } catch (err) {
      notify(err instanceof Error ? err.message : '저장에 실패했습니다.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black/40">
      {/* 상단 바 */}
      <div className="mx-auto flex w-full max-w-md items-center justify-between bg-white px-4 py-3 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">리포트 미리보기</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
        >
          <X size={22} />
        </button>
      </div>

      {/* 카드 영역 (스크롤) */}
      <div className="mx-auto w-full max-w-md flex-1 overflow-y-auto bg-slate-100 px-3 py-4">
        <ReportCard ref={cardRef} data={data} report={report} student={student} />
      </div>

      {/* 하단 액션 */}
      <div className="mx-auto w-full max-w-md border-t border-slate-200 bg-white px-4 py-3 pb-safe">
        <div className="flex flex-col gap-2">
          <Button onClick={handleCopyText} variant="secondary" size="lg" fullWidth>
            <Copy size={18} />
            카카오톡 텍스트 복사
          </Button>
          <div className="flex gap-2">
            {shareSupported && (
              <Button
                onClick={handleShareImage}
                size="lg"
                fullWidth
                disabled={busy}
              >
                <Share2 size={18} />
                이미지로 공유
              </Button>
            )}
            <Button
              onClick={handleDownload}
              variant={shareSupported ? 'secondary' : 'primary'}
              size="lg"
              fullWidth
              disabled={busy}
            >
              <Download size={18} />
              PNG 다운로드
            </Button>
          </div>
          {!shareSupported && (
            <p className="text-center text-xs text-slate-400">
              이 브라우저는 바로 공유를 지원하지 않습니다. PNG로 저장한 뒤 카카오톡으로 보내 주세요.
            </p>
          )}
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

export default ReportPreview
