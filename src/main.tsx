import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// 배포된 앱에서만 오프라인용 서비스 워커를 등록합니다 (개발 중에는 캐시가 방해되므로 끔).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 등록에 실패해도 앱은 온라인으로 정상 동작합니다.
    })
  })
}
