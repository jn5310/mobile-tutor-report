// 간단한 토스트 피드백
// 복사/공유/백업 등의 결과를 짧은 메시지로 하단에 띄웁니다.

import { useEffect } from 'react'

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

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-6">
      <div
        role="status"
        className={[
          'pointer-events-auto max-w-sm rounded px-4 py-3 text-[15px] text-white',
          toast.kind === 'success' ? 'bg-ink' : 'bg-kor',
        ].join(' ')}
      >
        {toast.message}
      </div>
    </div>
  )
}

export default Toast
