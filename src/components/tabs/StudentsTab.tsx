// 학생 관리 탭
// 학생 등록/수정/삭제 + 샘플 데이터 자동 생성.
// 이름/목표 대학만 자판으로 받고 나머지는 칩/세그먼트로 받습니다.
// 오늘 수업이 있는 학생을 위에 따로 모아 보여 줍니다.

import { useMemo, useState } from 'react'
import { ChevronRight, Pencil, Plus, X } from 'lucide-react'
import { AppData, Report, Student, Subject } from '../../types'
import {
  addStudent,
  deleteStudent,
  getReportsByStudent,
  replaceData,
  updateStudent,
} from '../../lib/storage'
import { generateSampleData } from '../../lib/sampleData'
import Button from '../ui/Button'
import Chip from '../ui/Chip'
import Segmented from '../ui/Segmented'
import SubjectTag from '../ui/SubjectTag'
import { TabProps } from './types'

const GRADES = ['중1', '중2', '중3', '고1', '고2', '고3', 'N수'] as const
const SUBJECTS: readonly Subject[] = ['국어', '수학', '국수']
const DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const
const JS_DAY_TO_KO = ['일', '월', '화', '수', '목', '금', '토']
const TARGET_GRADES = ['1등급', '2등급', '3등급', '백분위 90+', '백분위 80+', '상위권 유지'] as const

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

function daysSince(iso: string): number {
  const then = new Date(`${iso}T00:00:00`)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((now.getTime() - then.getTime()) / 86400000)
}

function lastReportLabel(report: Report | undefined): string {
  if (!report) {
    return '아직 리포트 없음'
  }
  const n = daysSince(report.date)
  const [, m, d] = report.date.split('-')
  const when = n <= 0 ? '오늘' : n === 1 ? '어제' : `${n}일 전`
  return `마지막 리포트 ${Number(m)}/${Number(d)} · ${when}`
}

function latestScoreLabel(report: Report | undefined): string {
  const scored = report?.testScores ?? []
  return scored.map((t) => `${t.subject} ${t.score}`).join(' · ')
}

/** 리포트 중 점수가 있는 가장 최근 것 (점수 표시에 사용). */
function latestScored(data: AppData, studentId: string): Report | undefined {
  return getReportsByStudent(data, studentId).find((r) => r.testScores.length > 0)
}

function WeekStrip({ days }: { days: string[] }) {
  return (
    <div className="flex gap-[3px]" aria-label={`수업 요일 ${days.join(', ') || '미정'}`}>
      {DAYS.map((d) => {
        const on = days.includes(d)
        return (
          <span
            key={d}
            className={[
              'flex h-5 w-5 items-center justify-center rounded-sm text-2xs',
              on ? 'bg-ink font-semibold text-paper' : 'text-ink-mute',
            ].join(' ')}
          >
            {d}
          </span>
        )
      })}
    </div>
  )
}

function StudentsTab({ data, setData, goTo }: TabProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())

  const today = JS_DAY_TO_KO[new Date().getDay()]

  const { todays, others } = useMemo(() => {
    const t: Student[] = []
    const o: Student[] = []
    for (const s of data.students) {
      ;(s.lessonDays.includes(today) ? t : o).push(s)
    }
    return { todays: t, others: o }
  }, [data.students, today])

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
        : DAYS.filter((d) => d === day || prev.lessonDays.includes(d)),
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

  const handleDelete = () => {
    const s = data.students.find((x) => x.id === editingId)
    if (!s) {
      return
    }
    const count = data.reports.filter((r) => r.studentId === s.id).length
    const ok = window.confirm(
      `${s.name} 학생을 삭제할까요?\n리포트 ${count}건도 함께 지워지고 되돌릴 수 없습니다.`,
    )
    if (ok) {
      setData(deleteStudent(data, s.id))
      closeForm()
    }
  }

  const handleSample = () => {
    if (data.students.length > 0) {
      const ok = window.confirm('지금 있는 학생과 리포트를 모두 지우고 샘플 데이터로 바꿉니다. 계속할까요?')
      if (!ok) {
        return
      }
    }
    setData(replaceData({ ...generateSampleData(), settings: data.settings }))
  }

  const renderRow = (s: Student) => {
    const reports = getReportsByStudent(data, s.id)
    const scored = latestScored(data, s.id)
    const scoreText = latestScoreLabel(scored)
    return (
      <li key={s.id} className="border-b border-line last:border-b-0">
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => goTo('report', s.id)}
            className="flex min-w-0 flex-1 flex-col gap-1.5 py-3.5 pl-4 pr-2 text-left active:bg-paper"
          >
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold text-ink">{s.name}</span>
              <span className="text-sm text-ink-soft">{s.grade}</span>
              <SubjectTag subject={s.subjects} />
            </div>
            <div className="truncate text-sm text-ink-soft">
              목표 {[s.targetUniversity, s.targetGrade].filter(Boolean).join(' · ') || '미정'}
            </div>
            <div className="flex items-center justify-between gap-2">
              <WeekStrip days={s.lessonDays} />
              {scoreText && <span className="tabular text-[13px] text-ink-soft">최근 {scoreText}</span>}
            </div>
            <div className="text-[13px] text-ink-mute">{lastReportLabel(reports[0])}</div>
          </button>
          <div className="flex flex-col items-center justify-center border-l border-line">
            <button
              type="button"
              onClick={() => openEdit(s)}
              aria-label={`${s.name} 정보 수정`}
              className="flex h-12 w-12 items-center justify-center text-ink-soft active:bg-paper"
            >
              <Pencil size={18} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => goTo('report', s.id)}
              aria-label={`${s.name} 리포트 쓰기`}
              className="flex h-12 w-12 items-center justify-center text-ink active:bg-paper"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </li>
    )
  }

  return (
    <section className="pb-4">
      <div className="flex items-end justify-between px-4 pb-3 pt-5">
        <div>
          <h2 className="text-[22px] font-bold text-ink">학생 관리</h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            {data.students.length > 0 ? `${data.students.length}명 · 이름을 누르면 리포트를 씁니다` : '학생을 먼저 등록해 주세요'}
          </p>
        </div>
        <Button onClick={openAdd} size="md">
          <Plus size={18} />
          학생 추가
        </Button>
      </div>

      {data.students.length === 0 ? (
        <div className="mx-4 mt-2 rounded border border-line bg-white px-5 py-8">
          <p className="text-[15px] leading-relaxed text-ink">
            아직 등록된 학생이 없습니다.
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            어떻게 쓰는지 먼저 보고 싶다면 예시 학생 3명과 지난 리포트를 넣어 볼 수 있습니다. 나중에 데이터 백업 탭에서 언제든 지울 수 있어요.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button onClick={handleSample} size="lg" fullWidth>
              샘플 학생 데이터 자동 생성
            </Button>
            <Button onClick={openAdd} variant="secondary" size="lg" fullWidth>
              직접 학생 등록하기
            </Button>
          </div>
        </div>
      ) : (
        <>
          {todays.length > 0 && (
            <>
              <h3 className="px-4 pb-2 pt-2 text-[13px] font-semibold text-brand">
                오늘({today}) 수업 {todays.length}명
              </h3>
              <ul className="sheet !px-0 !py-0">{todays.map(renderRow)}</ul>
            </>
          )}
          {others.length > 0 && (
            <>
              <h3 className="px-4 pb-2 pt-5 text-[13px] font-semibold text-ink-soft">
                {todays.length > 0 ? '다른 요일' : '전체 학생'}
              </h3>
              <ul className="sheet !px-0 !py-0">{others.map(renderRow)}</ul>
            </>
          )}
          <div className="px-4 pt-6">
            <button
              type="button"
              onClick={handleSample}
              className="min-h-[44px] text-sm text-ink-mute underline underline-offset-4"
            >
              샘플 학생 데이터 자동 생성
            </button>
          </div>
        </>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-30 mx-auto flex w-full max-w-md flex-col justify-end bg-ink/40">
          <div className="max-h-[92vh] overflow-y-auto rounded-t-xl bg-paper pb-safe">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper px-4 py-2">
              <h3 className="text-[17px] font-bold text-ink">
                {editingId ? '학생 정보 수정' : '새 학생'}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                aria-label="닫기"
                className="-mr-2 flex h-11 w-11 items-center justify-center text-ink-soft active:text-ink"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex flex-col gap-6 px-4 py-5">
              <div>
                <label className="field-label" htmlFor="student-name">
                  이름
                </label>
                <input
                  id="student-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="예: 김서연"
                  autoComplete="off"
                  className="text-input"
                />
              </div>

              <div>
                <span className="field-label">학년</span>
                <div className="flex flex-wrap gap-1.5">
                  {GRADES.map((g) => (
                    <Chip key={g} label={g} selected={form.grade === g} onClick={() => setForm({ ...form, grade: g })} />
                  ))}
                </div>
              </div>

              <div>
                <span className="field-label">수강 과목</span>
                <Segmented
                  options={SUBJECTS}
                  value={form.subjects}
                  onChange={(v) => setForm({ ...form, subjects: v })}
                  hints={{ 국수: '국어+수학' }}
                />
              </div>

              <div>
                <span className="field-label">수업 요일</span>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((d) => (
                    <Chip key={d} label={d} selected={form.lessonDays.includes(d)} onClick={() => toggleDay(d)} />
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="student-univ">
                  목표 대학 <span className="text-ink-mute">(선택)</span>
                </label>
                <input
                  id="student-univ"
                  type="text"
                  value={form.targetUniversity}
                  onChange={(e) => setForm({ ...form, targetUniversity: e.target.value })}
                  placeholder="예: 연세대학교"
                  autoComplete="off"
                  className="text-input"
                />
              </div>

              <div>
                <span className="field-label">목표 성적</span>
                <div className="flex flex-wrap gap-1.5">
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

              <div className="flex gap-2 pt-1">
                <Button onClick={closeForm} variant="secondary" size="lg" fullWidth>
                  취소
                </Button>
                <Button onClick={handleSave} size="lg" fullWidth disabled={!canSave}>
                  저장
                </Button>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="min-h-[44px] self-center text-sm text-kor underline underline-offset-4"
                >
                  이 학생 삭제
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default StudentsTab
