// 리포트 미리보기
// 리포트 카드와 보내기 버튼(이미지로 보내기 / 카카오톡 글 복사 / PNG 저장)을 담습니다.
// 리포트 저장 직후, 그리고 히스토리 탭에서 엽니다.
//
// 아이폰 사파리는 버튼을 누른 뒤 시간이 걸리는 작업을 하고 나서 공유창을 열면
// 막는 경우가 있습니다. 그래서 화면이 열리자마자 이미지를 미리 만들어 두고,
// 버튼을 누르면 바로 공유창을 띄웁니다.

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, Copy, Download, Pencil, Send, Trash2 } from 'lucide-react'
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
  /** 히스토리에서 열었을 때만 전달: 이 리포트 고치기. */
  onEdit?: () => void
  /** 히스토리에서 열었을 때만 전달: 이 리포트 지우기. */
  onDelete?: () => void
}

function pngFileName(student: Student, report: Report): string {
  const safeName = student.name.replace(/\s+/g, '')
  return `리포트_${safeName}_${report.date}.png`
}

function ReportPreview({ data, report, student, onClose, onEdit, onDelete }: ReportPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const blobRef = useRef<Blob | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [showText, setShowText] = useState(false)
  const shareSupported = isWebShareSupported()
  const kakaoText = toKakaoText(report, student, data)

  const notify = (message: string, kind: ToastState['kind'] = 'success') => setToast({ message, kind })

  // 열리자마자 PNG 를 미리 만들어 둡니다.
  useEffect(() => {
    let cancelled = false
    blobRef.current = null
    setReady(false)
    const timer = window.setTimeout(async () => {
      if (!cardRef.current) {
        return
      }
      try {
        const blob = await exportCardToPng(cardRef.current)
        if (!cancelled) {
          blobRef.current = blob
          setReady(true)
        }
      } catch {
        // 버튼을 누를 때 다시 시도합니다.
      }
    }, 150)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [report, data.settings])

  // 미리보기가 열려 있는 동안 뒤쪽 화면이 스크롤되지 않게 합니다.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const getBlob = async (): Promise<Blob | null> => {
    if (blobRef.current) {
      return blobRef.current
    }
    if (!cardRef.current) {
      return null
    }
    const blob = await exportCardToPng(cardRef.current)
    blobRef.current = blob
    setReady(true)
    return blob
  }

  const handleCopyText = async () => {
    try {
      await copyToClipboard(kakaoText)
      notify('복사했습니다. 카카오톡 대화방에 붙여 넣으세요.')
    } catch (err) {
      notify(err instanceof Error ? err.message : '복사에 실패했습니다.', 'error')
    }
  }

  const handleShareImage = async () => {
    setBusy(true)
    try {
      const blob = await getBlob()
      if (!blob) {
        return
      }
      await shareCardImage(blob, pngFileName(student, report))
    } catch (err) {
      // 이미지를 만드는 사이 사파리가 공유를 막은 경우: 이미지는 준비됐으니 다시 누르면 열립니다.
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        notify('이미지를 준비했습니다. 한 번 더 눌러 주세요.', 'error')
      } else {
        notify(err instanceof Error ? err.message : '공유에 실패했습니다.', 'error')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleDownload = async () => {
    setBusy(true)
    try {
      const blob = await getBlob()
      if (blob) {
        downloadPng(blob, pngFileName(student, report))
        notify('이미지를 저장했습니다.')
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : '저장에 실패했습니다.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 mx-auto flex w-full max-w-md flex-col bg-[#DDD8CD]">
      <div className="pt-safe border-b border-line bg-paper">
        <div className="flex h-12 items-center justify-between px-1">
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-11 items-center gap-0.5 pl-2 pr-3 text-[15px] text-ink active:text-ink-soft"
          >
            <ChevronLeft size={22} />
            닫기
          </button>
          <span className="text-[15px] font-semibold text-ink">{student.name} 리포트</span>
          <div className="flex">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label="이 리포트 수정"
                className="flex h-11 w-11 items-center justify-center text-ink-soft active:text-ink"
              >
                <Pencil size={18} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label="이 리포트 삭제"
                className="flex h-11 w-11 items-center justify-center text-kor"
              >
                <Trash2 size={18} />
              </button>
            )}
            {!onEdit && !onDelete && <span className="w-11" />}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <ReportCard ref={cardRef} data={data} report={report} student={student} />

        <div className="mx-auto mt-3 w-[360px] max-w-full">
          <button
            type="button"
            onClick={() => setShowText((v) => !v)}
            aria-expanded={showText}
            className="flex min-h-[44px] w-full items-center justify-between rounded-sm border border-line bg-paper px-3 text-sm text-ink-soft"
          >
            카카오톡으로 보낼 글 미리보기
            <ChevronDown size={18} className={showText ? 'rotate-180' : ''} />
          </button>
          {showText && (
            <pre className="whitespace-pre-wrap break-words rounded-b-sm border border-t-0 border-line bg-[#FFF9C4] px-3 py-3 font-sans text-[14px] leading-relaxed text-ink">
              {kakaoText}
            </pre>
          )}
        </div>
      </div>

      <div className="border-t border-line bg-paper px-4 pb-safe pt-3">
        <div className="flex flex-col gap-2 pb-3">
          {shareSupported ? (
            <Button onClick={handleShareImage} size="lg" fullWidth disabled={busy}>
              <Send size={18} />
              {ready ? '이미지로 카카오톡 보내기' : '이미지 준비 중…'}
            </Button>
          ) : null}
          <div className="flex gap-2">
            <Button onClick={handleCopyText} variant={shareSupported ? 'secondary' : 'primary'} size="lg" fullWidth>
              <Copy size={17} />
              카톡 글 복사
            </Button>
            <Button onClick={handleDownload} variant="secondary" size="lg" fullWidth disabled={busy}>
              <Download size={17} />
              PNG 저장
            </Button>
          </div>
          {!shareSupported && (
            <p className="text-center text-[12px] leading-snug text-ink-mute">
              이 브라우저는 바로 보내기를 지원하지 않습니다. PNG로 저장한 뒤 카카오톡에서 사진으로 보내 주세요.
            </p>
          )}
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

export default ReportPreview
