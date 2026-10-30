import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// @types/node 없이 환경 변수만 읽기 위한 최소 선언
declare const process: { env: Record<string, string | undefined> }

// https://vitejs.dev/config/
// BASE_PATH: 앱이 올라갈 경로. Vercel 은 '/'(기본값),
// GitHub Pages 는 '/mobile-tutor-report/' 처럼 저장소 이름 경로를 씁니다.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
