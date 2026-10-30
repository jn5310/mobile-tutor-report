// 리포트 작성 탭
// 학생 선택 -> 01 수업 기본 -> 02 테스트 점수 -> 03 국어 / 04 수학 -> 05 총평 -> 06 다음 과제 -> 저장.
// 칩/슬라이더/스텝퍼/별점/세그먼트 위주로 구성해 자판 입력을 줄입니다.
// 히스토리에서 '수정'을 누르면 기존 리포트를 불러와 고칠 수 있습니다.

import { ReactNode, useEffect, useMemo, useState } from 'react'
import { History, RefreshCw } from 'lucide-react'
import {
  MathUnderstanding,
  Report,
  ReportTestScore,
  ScoreSubject,
  Student,
} from '../../types'
import { addReport, getLast8Scores, getReportsByStudent, updateReport } from '../../lib/storage'
import ReportPreview from '../report/ReportPreview'
import {
  ComposedComment,
  KOREAN_AREAS,
  KOREAN_TAGS,
  KOREAN_TAG_NOTES,
  MATH_ERROR_CAUSES,
  SubjectScore,
  composeOverallComment,
} from '../../data/feedbackTemplates'
import Button from '../ui/Button'
import Chip from '../ui/Chip'
import ErrorRatioBar from '../report/ErrorRatioBar'
import ScoreInput from '../ui/ScoreInput'
import Segmented from '../ui/Segmented'
import Slider from '../ui/Slider'
import StarRating from '../ui/StarRating'
import Stepper from '../ui/Stepper'
import StudentPicker from '../StudentPicker'
import { TabProps } from './types'

const HOMEWORK_PRESETS = [0, 25, 50, 75, 100] as const
const UNDERSTANDINGS: readonly MathUnderstanding[] = ['상', '중', '하']
const ASSIGNMENT_PRESETS = [
  '오답 노트 정리',
  '교재 복습 1단원',
  '모의고사 1회분',
  '단어·개념 암기',
  '지문 5세트 풀이',
  '유형별 20문항',
  '틀린 문제 다시 풀기',
] as const

const COMMENT_VERSIONS: { key: keyof ComposedComment; label: string }[] = [
  { key: 'balanced', label: '균형형' },
  { key: 'praise', label: '칭찬 중심' },
  { key: 'improve', label: '약점 보완 중심' },
]

const STRENGTH_TAGS = KOREAN_TAGS.filter((t) => KOREAN_TAG_NOTES[t].kind === 'strength')
const WEAKNESS_TAGS = KOREAN_TAGS.filter((t) => KOREAN_TAG_NOTES[t].kind === 'weakness')

function isoOf(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function dayOffsetIso(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return isoOf(d)
}

function scoreSubjectsOf(student: Student): ScoreSubject[] {
  return student.subjects === '국수' ? ['국어', '수학'] : [student.subjects]
}

interface Draft {
  date: string
  focus: number
  homeworkRate: number
  scores: Record<ScoreSubject, number>
  scoreEntered: Record<ScoreSubject, boolean>
  koreanAreas: string[]
  koreanTags: string[]
  mathUnit: string
  mathUnderstanding: MathUnderstanding
  errorCounts: Record<string, number>
  overallComment: string
  nextAssignment: string
}

function emptyDraft(): Draft {
  return {
    date: dayOffsetIso(0),
    focus: 4,
    homeworkRate: 100,
    scores: { 국어: 80, 수학: 80 },
    scoreEntered: { 국어: false, 수학: false },
    koreanAreas: [],
    koreanTags: [],
    mathUnit: '',
    mathUnderstanding: '중',
    errorCounts: {},
    overallComment: '',
    nextAssignment: '',
  }
}

function draftFromReport(r: Report): Draft {
  const base = emptyDraft()
  const scores = { ...base.scores }
  const entered = { ...base.scoreEntered }
  for (const t of r.testScores) {
    scores[t.subject] = t.score
    entered[t.subject] = true
  }
  const counts: Record<string, number> = { ...(r.mathErrorCounts ?? {}) }
  for (const c of r.mathErrorCauses) {
    if (!counts[c]) {
      counts[c] = 1
    }
  }
  return {
    date: r.date,
    focus: r.attendanceFocus,
    homeworkRate: r.homeworkRate,
    scores,
    scoreEntered: entered,
    koreanAreas: [...r.koreanAreas],
    koreanTags: [...r.koreanTags],
    mathUnit: r.mathUnit,
    mathUnderstanding: r.mathUnderstanding,
    errorCounts: counts,
    overallComment: r.overallComment,
    nextAssignment: r.nextAssignment,
  }
}

function Section({
  index,
  title,
  aside,
  children,
}: {
  index: string
  title: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="sheet">
      <div className="section-label justify-between">
        <span className="flex items-baseline gap-2">
          <span className="idx">{index}</span>
          <span className="text-[15px]">{title}</span>
        </span>
        {aside}
      </div>
      {children}
    </section>
  )
}

function ReportBuilderTab({
  data,
  setData,
  studentId,
  setStudentId,
  goTo,
  editReportId,
  setEditReportId,
}: TabProps) {
  const student = useMemo(
    () => data.students.find((s) => s.id === studentId) ?? null,
    [data.students, studentId],
  )
  const scoreSubjects = useMemo(() => (student ? scoreSubjectsOf(student) : []), [student])
  const showKorean = student?.subjects === '국어' || student?.subjects === '국수'
  const showMath = student?.subjects === '수학' || student?.subjects === '국수'

  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [composed, setComposed] = useState<ComposedComment | null>(null)
  const [version, setVersion] = useState<keyof ComposedComment>('balanced')
  const [variant, setVariant] = useState(0)
  const [previewReport, setPreviewReport] = useState<Report | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  // 학생을 바꾸면 새 리포트로 시작합니다.
  // 히스토리에서 수정하려고 불러온 경우(editingId 가 있음)에는 비우지 않습니다.
  useEffect(() => {
    if (editingId) {
      return
    }
    setDraft(emptyDraft())
    setComposed(null)
  }, [studentId])

  // 히스토리에서 '수정'을 누른 경우 그 리포트로 폼을 채웁니다.
  useEffect(() => {
    if (!editReportId) {
      return
    }
    const r = data.reports.find((x) => x.id === editReportId)
    if (r) {
      setStudentId(r.studentId)
      setDraft(draftFromReport(r))
      setComposed(null)
      setEditingId(r.id)
    }
    setEditReportId(null)
  }, [editReportId, data.reports, setStudentId, setEditReportId])

  const pastReports = useMemo(
    () =>
      student
        ? getReportsByStudent(data, student.id).filter((r) => r.id !== editingId)
        : [],
    [data, student, editingId],
  )
  const lastReport = pastReports[0]

  /** 과목별 직전 점수 (수정 중인 리포트와 같은 날 이후 점수는 제외). */
  const previousScores = useMemo(() => {
    const out: Partial<Record<ScoreSubject, number>> = {}
    if (!student) {
      return out
    }
    for (const subj of scoreSubjects) {
      const hist = getLast8Scores(
        { ...data, reports: data.reports.filter((r) => r.id !== editingId) },
        student.id,
        subj,
      ).filter((s) => s.date < draft.date)
      if (hist.length > 0) {
        out[subj] = hist[hist.length - 1].score
      }
    }
    return out
  }, [data, student, scoreSubjects, editingId, draft.date])

  const recentUnits = useMemo(() => {
    const seen = new Set<string>()
    for (const r of pastReports) {
      const u = r.mathUnit.trim()
      if (u) {
        seen.add(u)
      }
      if (seen.size >= 3) {
        break
      }
    }
    return Array.from(seen)
  }, [pastReports])

  const toggleIn = (key: 'koreanAreas' | 'koreanTags', value: string) => {
    setDraft((d) => {
      const list = d[key]
      return { ...d, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] }
    })
  }

  const loadFromLast = () => {
    if (!lastReport) {
      return
    }
    patch({
      koreanAreas: [...lastReport.koreanAreas],
      mathUnit: lastReport.mathUnit,
      mathUnderstanding: lastReport.mathUnderstanding,
      nextAssignment: lastReport.nextAssignment,
    })
  }

  const subjectScores = (): SubjectScore[] =>
    scoreSubjects
      .filter((s) => draft.scoreEntered[s])
      .map((s) => ({ subject: s, latest: draft.scores[s], previous: previousScores[s] }))

  const errorCauses = MATH_ERROR_CAUSES.filter((c) => (draft.errorCounts[c] ?? 0) > 0)

  const compose = (nextVariant: number) => {
    if (!student) {
      return
    }
    const result = composeOverallComment({
      studentName: student.name,
      koreanTags: showKorean ? draft.koreanTags : [],
      koreanAreas: showKorean ? draft.koreanAreas : [],
      mathErrorCauses: showMath ? errorCauses : [],
      mathErrorCounts: showMath ? draft.errorCounts : {},
      mathUnit: showMath ? draft.mathUnit : '',
      mathUnderstanding: showMath ? draft.mathUnderstanding : undefined,
      homeworkRate: draft.homeworkRate,
      subjectScores: subjectScores(),
      attendanceFocus: draft.focus,
      variant: nextVariant,
    })
    setVariant(nextVariant)
    setComposed(result)
    patch({ overallComment: result[version] })
  }

  const handleCompose = () => {
    if (draft.overallComment.trim() && !composed) {
      const ok = window.confirm('직접 쓴 총평이 있습니다. 자동 작성한 문장으로 바꿀까요?')
      if (!ok) {
        return
      }
    }
    compose(composed ? variant + 1 : Math.floor(Math.random() * 1000))
  }

  const selectVersion = (key: keyof ComposedComment) => {
    setVersion(key)
    if (composed) {
      patch({ overallComment: composed[key] })
    }
  }

  const addAssignment = (a: string) => {
    setDraft((d) => {
      const cur = d.nextAssignment.trim()
      if (cur.split('\n').some((line) => line.replace(/^[-·•]\s*/, '') === a)) {
        return d
      }
      return { ...d, nextAssignment: cur ? `${cur}\n${a}` : a }
    })
  }

  const handleSave = () => {
    if (!student) {
      return
    }
    const testScores: ReportTestScore[] = scoreSubjects
      .filter((subj) => draft.scoreEntered[subj])
      .map((subj) => ({ subject: subj, score: draft.scores[subj] }))

    const counts: Record<string, number> = {}
    for (const c of errorCauses) {
      counts[c] = draft.errorCounts[c]
    }

    const payload = {
      studentId: student.id,
      date: draft.date,
      attendanceFocus: draft.focus,
      homeworkRate: draft.homeworkRate,
      koreanAreas: showKorean ? draft.koreanAreas : [],
      koreanTags: showKorean ? draft.koreanTags : [],
      mathUnit: showMath ? draft.mathUnit.trim() : '',
      mathUnderstanding: draft.mathUnderstanding,
      mathErrorCauses: showMath ? errorCauses : [],
      mathErrorCounts: showMath ? counts : {},
      testScores,
      overallComment: draft.overallComment.trim(),
      nextAssignment: draft.nextAssignment.trim(),
    }

    let nextData
    let saved: Report | undefined
    if (editingId) {
      nextData = updateReport(data, editingId, payload)
      saved = nextData.reports.find((r) => r.id === editingId)
    } else {
      nextData = addReport(data, payload)
      saved = nextData.reports[nextData.reports.length - 1]
    }
    setData(nextData)
    setDraft(emptyDraft())
    setComposed(null)
    setEditingId(null)
    if (saved) {
      setPreviewReport(saved)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft(emptyDraft())
    setComposed(null)
  }

  const previewStudent = useMemo(
    () => (previewReport ? data.students.find((s) => s.id === previewReport.studentId) ?? null : null),
    [previewReport, data.students],
  )

  if (data.students.length === 0) {
    return (
      <section className="px-4 pt-5">
        <h2 className="text-[22px] font-bold text-ink">리포트 작성</h2>
        <div className="mt-4 rounded border border-line bg-white px-5 py-8">
          <p className="text-[15px] text-ink">리포트를 쓰려면 학생이 한 명 이상 있어야 합니다.</p>
          <div className="mt-4">
            <Button onClick={() => goTo('students')} variant="secondary" fullWidth>
              학생 관리로 가기
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const hasErrors = errorCauses.length > 0

  return (
    <div className="pb-4">
      <div className="px-4 pb-3 pt-5">
        <h2 className="text-[22px] font-bold text-ink">{editingId ? '리포트 수정' : '리포트 작성'}</h2>
        {editingId && (
          <p className="mt-1 text-sm text-ink-soft">
            저장하면 기존 리포트가 이 내용으로 바뀝니다.{' '}
            <button type="button" onClick={cancelEdit} className="min-h-[44px] underline underline-offset-4">
              수정 취소
            </button>
          </p>
        )}
      </div>

      <StudentPicker
        students={data.students}
        value={studentId}
        onChange={setStudentId}
        locked={Boolean(editingId)}
      />

      {student && (
        <div className="flex flex-col gap-3">
          {lastReport && !editingId && (
            <div className="mx-4 flex items-center justify-between gap-3 rounded border border-dashed border-ink-mute/50 px-3 py-2">
              <p className="text-[13px] leading-snug text-ink-soft">
                지난 수업({Number(lastReport.date.slice(5, 7))}/{Number(lastReport.date.slice(8, 10))})의 영역·단원·과제를
                그대로 가져올 수 있어요.
              </p>
              <button
                type="button"
                onClick={loadFromLast}
                className="flex min-h-[44px] shrink-0 items-center gap-1 text-sm font-semibold text-ink"
              >
                <History size={16} />
                불러오기
              </button>
            </div>
          )}

          <Section index="01" title="수업 기본">
            <span className="field-label">수업 일자</span>
            <div className="mb-5 flex gap-1.5">
              <Chip label="오늘" selected={draft.date === dayOffsetIso(0)} onClick={() => patch({ date: dayOffsetIso(0) })} />
              <Chip label="어제" selected={draft.date === dayOffsetIso(-1)} onClick={() => patch({ date: dayOffsetIso(-1) })} />
              <input
                type="date"
                value={draft.date}
                onChange={(e) => e.target.value && patch({ date: e.target.value })}
                aria-label="수업 일자 직접 선택"
                className="text-input !h-11 min-w-0 flex-1 tabular"
              />
            </div>

            <span className="field-label">출결·집중도</span>
            <div className="mb-5">
              <StarRating value={draft.focus} onChange={(v) => patch({ focus: v })} />
            </div>

            <div className="mb-2 flex items-baseline justify-between">
              <span className="field-label !mb-0">숙제 이행률</span>
              <span className="tabular text-[17px] font-bold text-ink">{draft.homeworkRate}%</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {HOMEWORK_PRESETS.map((p) => (
                <Chip
                  key={p}
                  label={p === 0 ? '안 함' : `${p}%`}
                  selected={draft.homeworkRate === p}
                  onClick={() => patch({ homeworkRate: p })}
                />
              ))}
            </div>
            <Slider value={draft.homeworkRate} onChange={(v) => patch({ homeworkRate: v })} label="숙제 이행률" />
          </Section>

          <Section index="02" title="오늘 테스트 점수">
            <div className="flex flex-col gap-5">
              {scoreSubjects.map((subj) => {
                const tone = subj === '국어' ? 'kor' : 'math'
                const on = draft.scoreEntered[subj]
                return (
                  <div key={subj}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[15px] font-semibold ${tone === 'kor' ? 'text-kor' : 'text-math'}`}>{subj}</span>
                      <div className="flex overflow-hidden rounded border border-line bg-white text-sm">
                        <button
                          type="button"
                          onClick={() => patch({ scoreEntered: { ...draft.scoreEntered, [subj]: false } })}
                          aria-pressed={!on}
                          className={['min-h-[40px] px-3', !on ? 'bg-ink text-paper' : 'text-ink-soft'].join(' ')}
                        >
                          시험 안 봄
                        </button>
                        <button
                          type="button"
                          onClick={() => patch({ scoreEntered: { ...draft.scoreEntered, [subj]: true } })}
                          aria-pressed={on}
                          aria-label={`${subj} 점수 기록`}
                          className={['min-h-[40px] border-l border-line px-3', on ? 'bg-ink text-paper' : 'text-ink-soft'].join(' ')}
                        >
                          점수 기록
                        </button>
                      </div>
                    </div>
                    {on && (
                      <div className="mt-3">
                        <ScoreInput
                          value={draft.scores[subj]}
                          onChange={(v) => patch({ scores: { ...draft.scores, [subj]: v } })}
                          previous={previousScores[subj]}
                          tone={tone}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Section>

          {showKorean && (
            <Section index="03" title="국어">
              <span className="field-label">수업 영역</span>
              <div className="mb-5 grid grid-cols-3 gap-1">
                {KOREAN_AREAS.map((area) => (
                  <Chip
                    key={area}
                    tone="kor"
                    label={area}
                    selected={draft.koreanAreas.includes(area)}
                    onClick={() => toggleIn('koreanAreas', area)}
                  />
                ))}
              </div>

              <span className="field-label">잘한 점</span>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {STRENGTH_TAGS.map((tag) => (
                  <Chip
                    key={tag}
                    tone="kor"
                    label={tag}
                    selected={draft.koreanTags.includes(tag)}
                    onClick={() => toggleIn('koreanTags', tag)}
                  />
                ))}
              </div>

              <span className="field-label">보완할 점</span>
              <div className="flex flex-wrap gap-1.5">
                {WEAKNESS_TAGS.map((tag) => (
                  <Chip
                    key={tag}
                    tone="kor"
                    label={tag}
                    selected={draft.koreanTags.includes(tag)}
                    onClick={() => toggleIn('koreanTags', tag)}
                  />
                ))}
              </div>
            </Section>
          )}

          {showMath && (
            <Section index={showKorean ? '04' : '03'} title="수학">
              <label className="field-label" htmlFor="math-unit">
                진도 단원
              </label>
              <input
                id="math-unit"
                type="text"
                value={draft.mathUnit}
                onChange={(e) => patch({ mathUnit: e.target.value })}
                placeholder="예: 수열의 극한"
                autoComplete="off"
                className="text-input"
              />
              {recentUnits.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {recentUnits.map((u) => (
                    <Chip key={u} label={u} tone="math" selected={draft.mathUnit === u} onClick={() => patch({ mathUnit: u })} />
                  ))}
                </div>
              )}

              <span className="field-label mt-5">개념 이해도</span>
              <Segmented
                options={UNDERSTANDINGS}
                value={draft.mathUnderstanding}
                onChange={(v) => patch({ mathUnderstanding: v })}
                hints={{ 상: '응용 가능', 중: '기본 이해', 하: '다시 설명 필요' }}
              />

              <div className="mt-5 flex items-baseline justify-between">
                <span className="field-label !mb-0">오답 원인 (틀린 문항 수)</span>
                {hasErrors && (
                  <button
                    type="button"
                    onClick={() => patch({ errorCounts: {} })}
                    className="min-h-[44px] text-[13px] text-ink-mute underline underline-offset-4"
                  >
                    비우기
                  </button>
                )}
              </div>
              <ul className="mt-1 divide-y divide-line rounded border border-line bg-white">
                {MATH_ERROR_CAUSES.map((cause) => {
                  const n = draft.errorCounts[cause] ?? 0
                  return (
                    <li key={cause} className="flex items-center justify-between gap-2 py-1 pl-3 pr-1">
                      <button
                        type="button"
                        onClick={() => patch({ errorCounts: { ...draft.errorCounts, [cause]: Math.min(20, n + 1) } })}
                        className={['min-h-[44px] flex-1 text-left text-[15px]', n > 0 ? 'font-semibold text-math' : 'text-ink'].join(' ')}
                      >
                        {cause}
                      </button>
                      <Stepper
                        value={n}
                        onChange={(v) => patch({ errorCounts: { ...draft.errorCounts, [cause]: v } })}
                        min={0}
                        max={20}
                        label={cause}
                      />
                    </li>
                  )
                })}
              </ul>
              {hasErrors && (
                <div className="mt-3">
                  <ErrorRatioBar counts={draft.errorCounts} />
                </div>
              )}
            </Section>
          )}

          <Section
            index={showKorean && showMath ? '05' : '04'}
            title="선생님 총평"
            aside={
              composed ? (
                <span className="text-2xs font-normal text-ink-mute">고른 태그와 점수로 만든 문장</span>
              ) : null
            }
          >
            <div className="mb-3 flex overflow-hidden rounded border border-line bg-white" role="radiogroup" aria-label="총평 버전">
              {COMMENT_VERSIONS.map(({ key, label }, i) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={version === key}
                  onClick={() => selectVersion(key)}
                  className={[
                    'min-h-[44px] flex-1 text-sm',
                    i > 0 ? 'border-l border-line' : '',
                    version === key ? 'bg-ink font-semibold text-paper' : 'text-ink-soft',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
            <Button onClick={handleCompose} variant={composed ? 'secondary' : 'primary'} size="lg" fullWidth>
              {composed ? (
                <>
                  <RefreshCw size={17} />
                  다른 문장으로 다시 만들기
                </>
              ) : (
                '총평 자동 작성'
              )}
            </Button>
            <textarea
              value={draft.overallComment}
              onChange={(e) => patch({ overallComment: e.target.value })}
              rows={8}
              placeholder="버튼을 누르면 위에서 고른 내용으로 총평이 채워집니다. 채워진 문장은 자유롭게 고쳐 쓸 수 있어요."
              className="text-area mt-3"
            />
            <p className="tabular mt-1 text-right text-2xs text-ink-mute">{draft.overallComment.length}자</p>
          </Section>

          <Section index={showKorean && showMath ? '06' : '05'} title="다음 시간 과제">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {ASSIGNMENT_PRESETS.map((a) => (
                <Chip key={a} label={`+ ${a}`} onClick={() => addAssignment(a)} />
              ))}
            </div>
            <textarea
              value={draft.nextAssignment}
              onChange={(e) => patch({ nextAssignment: e.target.value })}
              rows={3}
              placeholder="위 항목을 누르면 한 줄씩 추가됩니다."
              className="text-area"
            />
          </Section>

          <div className="px-4 pt-2">
            <Button onClick={handleSave} size="lg" fullWidth>
              {editingId ? '수정 내용 저장하고 미리보기' : '저장하고 미리보기'}
            </Button>
            <p className="mt-2 text-center text-[13px] text-ink-mute">
              저장하면 학부모님께 보낼 리포트 카드가 바로 열립니다.
            </p>
          </div>
        </div>
      )}

      {previewReport && previewStudent && (
        <ReportPreview
          data={data}
          report={previewReport}
          student={previewStudent}
          onClose={() => setPreviewReport(null)}
        />
      )}
    </div>
  )
}

export default ReportBuilderTab
