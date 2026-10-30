// 간단한 토스트 피드백 (FEAT-004)
// 복사/공유/백업 등의 결과를 짧은 한국어 메시지로 하단에 띄웁니다.

import { useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

export type ToastKind = 'success' | 'error'

export interface ToastState {
  message: string
  kind: ToastKind
}

interface ToastProps {
  toast: ToastState | null
  onDismiss: () => void
  /** 자동 사라짐 시간(ms). */
  duration?: number
}

function Toast({ toast, onDismiss, duration = 2200 }: ToastProps) {
  useEffect(() => {
    if (!toast) {
      return
    }
    const timer = window.setTimeout(onDismiss, duration)
    return () => window.clearTimeout(timer)
  }, [toast, duration, onDismiss])

  if (!toast) {
    return null
  }

  const isSuccess = toast.kind === 'success'

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div
        role="status"
        className={[
          'pointer-events-auto flex max-w-md items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg',
          isSuccess ? 'bg-slate-900' : 'bg-red-600',
        ].join(' ')}
      >
        {isSuccess ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
        <span>{toast.message}</span>
      </div>
    </div>
  )
}

export default Toast
