// 학생 관리 탭 (FEAT-003)
// 학생 등록/수정/삭제 + 샘플 데이터 자동 생성.
// 타이핑을 최소화하기 위해 이름/목표 대학만 텍스트 입력이고 나머지는 칩/세그먼트로 받습니다.

import { useState } from 'react'
import { GraduationCap, Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { Student, Subject } from '../../types'
import { addStudent, deleteStudent, replaceData, updateStudent } from '../../lib/storage'
import { generateSampleData } from '../../lib/sampleData'
import Button from '../ui/Button'
import Chip from '../ui/Chip'
import Segmented from '../ui/Segmented'
import { TabProps } from './types'

const GRADES = ['중1', '중2', '중3', '고1', '고2', '고3', 'N수'] as const
const SUBJECTS: readonly Subject[] = ['국어', '수학', '국수']
const DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const
const TARGET_GRADES = [
  '1등급',
  '2등급',
  '3등급',
  '백분위 90+',
  '백분위 80+',
  '상위권 유지',
] as const

interface FormState {
  name: string
  grade: string
  subjects: Subject
  targetUniversity: string
  targetGrade: string
  lessonDays: string[]
}

function emptyForm(): FormState {
  return {
    name: '',
    grade: '고2',
    subjects: '국어',
    targetUniversity: '',
    targetGrade: '1등급',
    lessonDays: [],
  }
}

function fromStudent(s: Student): FormState {
  return {
    name: s.name,
    grade: s.grade,
    subjects: s.subjects,
    targetUniversity: s.targetUniversity,
    targetGrade: s.targetGrade,
    lessonDays: [...s.lessonDays],
  }
}

function StudentsTab({ data, setData }: TabProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  const openEdit = (s: Student) => {
    setEditingId(s.id)
    setForm(fromStudent(s))
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
  }

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      lessonDays: prev.lessonDays.includes(day)
        ? prev.lessonDays.filter((d) => d !== day)
        : [...prev.lessonDays, day],
    }))
  }

  const canSave = form.name.trim().length > 0

  const handleSave = () => {
    if (!canSave) {
      return
    }
    const payload = {
      name: form.name.trim(),
      grade: form.grade,
      subjects: form.subjects,
      targetUniversity: form.targetUniversity.trim(),
      targetGrade: form.targetGrade,
      lessonDays: form.lessonDays,
    }
    if (editingId) {
      setData(updateStudent(data, editingId, payload))
    } else {
      setData(addStudent(data, payload))
    }
    closeForm()
  }

  const handleDelete = (s: Student) => {
    const ok = window.confirm(
      `${s.name} 학생과 관련 리포트를 모두 삭제할까요? 되돌릴 수 없습니다.`,
    )
    if (ok) {
      setData(deleteStudent(data, s.id))
    }
  }

  const handleSample = () => {
    if (data.students.length > 0) {
      const ok = window.confirm(
        '현재 데이터를 모두 샘플 데이터로 교체합니다. 계속할까요?',
      )
      if (!ok) {
        return
      }
    }
    setData(replaceData(generateSampleData()))
  }

  return (
    <section className="px-4 py-4">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">학생 관리</h2>
        <Button onClick={openAdd} size="md">
          <Plus size={18} />
          학생 추가
        </Button>
      </header>

      {data.students.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <GraduationCap size={28} />
          </div>
          <p className="text-sm text-slate-500">
            아직 등록된 학생이 없습니다.
            <br />
            샘플 데이터로 기능을 바로 체험해 보세요.
          </p>
          <Button onClick={handleSample} variant="secondary" size="lg" fullWidth>
            <Sparkles size={18} />
            샘플 학생 데이터 자동 생성
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.students.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-bold text-slate-900">
                      {s.name}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {s.grade}
                    </span>
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                      {s.subjects}
                    </span>
                  </div>
                  <dl className="mt-2 space-y-1 text-sm text-slate-600">
                    <div className="flex gap-1">
                      <dt className="shrink-0 text-slate-400">목표</dt>
                      <dd className="truncate">
                        {s.targetUniversity || '미정'} · {s.targetGrade || '미정'}
                      </dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="shrink-0 text-slate-400">수업 요일</dt>
                      <dd>{s.lessonDays.length > 0 ? s.lessonDays.join(', ') : '미정'}</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    aria-label="수정"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:bg-slate-200"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s)}
                    aria-label="삭제"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 active:bg-red-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data.students.length > 0 && (
        <div className="mt-4">
          <Button onClick={handleSample} variant="ghost" size="md" fullWidth>
            <Sparkles size={18} />
            샘플 학생 데이터 자동 생성
          </Button>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-30 mx-auto flex w-full max-w-md flex-col justify-end bg-slate-900/40">
          <div className="max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-safe">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? '학생 수정' : '학생 추가'}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                aria-label="닫기"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  이름
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="학생 이름"
                  className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900 focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  학년
                </span>
                <div className="flex flex-wrap gap-2">
                  {GRADES.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      selected={form.grade === g}
                      onClick={() => setForm({ ...form, grade: g })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  수강 과목
                </span>
                <Segmented
                  options={SUBJECTS}
                  value={form.subjects}
                  onChange={(v) => setForm({ ...form, subjects: v })}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  목표 대학
                </label>
                <input
                  type="text"
                  value={form.targetUniversity}
                  onChange={(e) =>
                    setForm({ ...form, targetUniversity: e.target.value })
                  }
                  placeholder="예: 연세대학교"
                  className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900 focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  목표 성적
                </span>
                <div className="flex flex-wrap gap-2">
                  {TARGET_GRADES.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      selected={form.targetGrade === t}
                      onClick={() => setForm({ ...form, targetGrade: t })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  수업 요일
                </span>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <Chip
                      key={d}
                      label={d}
                      selected={form.lessonDays.includes(d)}
                      onClick={() => toggleDay(d)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button onClick={closeForm} variant="secondary" size="lg" fullWidth>
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  size="lg"
                  fullWidth
                  disabled={!canSave}
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default StudentsTab
