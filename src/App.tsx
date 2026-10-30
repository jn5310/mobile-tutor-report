import { BookOpen } from 'lucide-react'

function App() {
  return (
    <div className="app-shell flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white">
        <BookOpen size={32} />
      </div>
      <h1 className="text-xl font-bold text-slate-900">과외 리포트 생성기</h1>
      <p className="text-sm text-slate-500">
        엄지손가락 터치만으로 수업 리포트를 작성하고 바로 공유하세요.
      </p>
    </div>
  )
}

export default App
