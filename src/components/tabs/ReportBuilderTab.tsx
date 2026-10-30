// 리포트 작성 탭 (FEAT-003)
// 학생 선택 -> 공통 입력(일자/집중도/숙제율/테스트 점수) -> 과목별 입력(국어/수학)
// -> 총평 자동 작성(3버전) -> 다음 과제 -> 리포트 저장.
// 타이핑을 최소화하기 위해 칩/슬라이더/스텝퍼/별점/세그먼트 위주로 구성합니다.

import { useMemo, useState } from 'react'
import { Save, Sparkles, Wand2 } from 'lucide-react'
import {
  MathUnderstanding,
  Report,
  ReportTestScore,
  ScoreSubject,
  Student,
} from '../../types'
import { addReport, getLast8Scores } from '../../lib/storage'
import ReportPreview from '../report/ReportPreview'
import {
  ComposedComment,
  KOREAN_AREAS,
  KOREAN_TAGS,
  MATH_ERROR_CAUSES,
  composeOverallComment,
} from '../../data/feedbackTemplates'
import Button from '../ui/Button'
import Chip from '../ui/Chip'
import Segmented from '../ui/Segmented'
import Slider from '../ui/Slider'
import StarRating from '../ui/StarRating'
import Stepper from '../ui/Stepper'
import { TabProps } from './types'

const HOMEWORK_PRESETS = [0, 25, 50, 75, 100] as const
const UNDERSTANDINGS: readonly MathUnderstanding[] = ['상', '중', '하']
const ASSIGNMENT_PRESETS = [
  '교재 복습 1단원',
  '오답 노트 정리',
  '모의고사 1회분',
  '단어/개념 암기',
  '지문 5세트 풀이',
  '유형별 20문항',
] as const

const COMMENT_VERSIONS: {
  key: keyof ComposedComment
  label: string
}[] = [
  { key: 'praise', label: '칭찬 중심' },
  { key: 'improve', label: '약점 보완 중심' },
  { key: 'balanced', label: '균형형' },
]

function todayIso(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** 학생의 수강 과목으로부터 점수를 기록할 과목 목록을 구합니다. */
function scoreSubjectsOf(student: Student): ScoreSubject[] {
  if (student.subjects === '국수') {
    return ['국어', '수학']
  }
  return [student.subjects]
}

type SubTab = '국어' | '수학'

function ReportBuilderTab({ data, setData }: TabProps) {
  const [studentId, setStudentId] = useState<string | null>(
    data.students[0]?.id ?? null,
  )

  const student = useMemo(
    () => data.students.find((s) => s.id === studentId) ?? null,
    [data.students, studentId],
  )

  const scoreSubjects = useMemo(
    () => (student ? scoreSubjectsOf(student) : []),
    [student],
  )

  // 공통 입력 상태
  const [date, setDate] = useState<string>(todayIso())
  const [focus, setFocus] = useState<number>(3)
  const [homeworkRate, setHomeworkRate] = useState<number>(75)
  const [scores, setScores] = useState<Record<ScoreSubject, number>>({
    국어: 0,
    수학: 0,
  })

  // 국어 입력 상태
  const [koreanAreas, setKoreanAreas] = useState<string[]>([])
  const [koreanTags, setKoreanTags] = useState<string[]>([])

  // 수학 입력 상태
  const [mathUnit, setMathUnit] = useState<string>('')
  const [mathUnderstanding, setMathUnderstanding] =
    useState<MathUnderstanding>('중')
  const [mathErrorCauses, setMathErrorCauses] = useState<string[]>([])

  // 과목 서브탭
  const [subTab, setSubTab] = useState<SubTab>('국어')

  // 총평
  const [composed, setComposed] = useState<ComposedComment | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<
    keyof ComposedComment | null
  >(null)
  const [overallComment, setOverallComment] = useState<string>('')

  // 다음 과제
  const [nextAssignment, setNextAssignment] = useState<string>('')

  // 저장 직후 미리보기용 상태
  const [previewReport, setPreviewReport] = useState<Report | null>(null)

  const showKorean = student?.subjects === '국어' || student?.subjects === '국수'
  const showMath = student?.subjects === '수학' || student?.subjects === '국수'

  const toggle = (
    list: string[],
    setList: (next: string[]) => void,
    value: string,
  ) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const handleCompose = () => {
    if (!student) {
      return
    }
    const primary: ScoreSubject = showMath && !showKorean ? '수학' : '국어'
    const history = getLast8Scores(data, student.id, primary)
    const previousScore =
      history.length > 0 ? history[history.length - 1].score : undefined
    const result = composeOverallComment({
      studentName: student.name,
      koreanTags,
      koreanAreas,
      mathErrorCauses,
      mathUnderstanding: showMath ? mathUnderstanding : undefined,
      homeworkRate,
      latestScore: scores[primary] || undefined,
      previousScore,
      attendanceFocus: focus,
    })
    setComposed(result)
    setSelectedVersion('balanced')
    setOverallComment(result.balanced)
  }

  const selectVersion = (key: keyof ComposedComment) => {
    if (!composed) {
      return
    }
    setSelectedVersion(key)
    setOverallComment(composed[key])
  }

  const resetForm = () => {
    setDate(todayIso())
    setFocus(3)
    setHomeworkRate(75)
    setScores({ 국어: 0, 수학: 0 })
    setKoreanAreas([])
    setKoreanTags([])
    setMathUnit('')
    setMathUnderstanding('중')
    setMathErrorCauses([])
    setComposed(null)
    setSelectedVersion(null)
    setOverallComment('')
    setNextAssignment('')
  }

  const handleSave = () => {
    if (!student) {
      return
    }
    const testScores: ReportTestScore[] = scoreSubjects
      .filter((subj) => scores[subj] > 0)
      .map((subj) => ({ subject: subj, score: scores[subj] }))

    const nextData = addReport(data, {
      studentId: student.id,
      date,
      attendanceFocus: focus,
      homeworkRate,
      koreanAreas: showKorean ? koreanAreas : [],
      koreanTags: showKorean ? koreanTags : [],
      mathUnit: showMath ? mathUnit.trim() : '',
      mathUnderstanding,
      mathErrorCauses: showMath ? mathErrorCauses : [],
      testScores,
      overallComment: overallComment.trim(),
      nextAssignment: nextAssignment.trim(),
    })
    setData(nextData)

    // 방금 추가된 리포트(배열 마지막)를 미리보기로 열지 사용자에게 묻습니다.
    const savedReport = nextData.reports[nextData.reports.length - 1] ?? null
    resetForm()
    if (
      savedReport &&
      window.confirm(
        `${student.name} 학생의 리포트를 저장했습니다. 미리보기를 열어 공유하시겠습니까?`,
      )
    ) {
      setPreviewReport(savedReport)
    }
  }

  const previewStudent = useMemo(
    () =>
      previewReport
        ? data.students.find((s) => s.id === previewReport.studentId) ?? null
        : null,
    [previewReport, data.students],
  )

  if (data.students.length === 0) {
    return (
      <section className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Wand2 size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">리포트 작성</h2>
        <p className="text-sm text-slate-500">
          먼저 학생 관리 탭에서 학생을 등록해 주세요.
        </p>
      </section>
    )
  }

  return (
    <section className="px-4 py-4">
      <h2 className="mb-4 text-lg font-bold text-slate-900">리포트 작성</h2>

      {/* 학생 선택 */}
      <div className="mb-5">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
          학생 선택
        </span>
        <div className="flex flex-wrap gap-2">
          {data.students.map((s) => (
            <Chip
              key={s.id}
              label={`${s.name} (${s.subjects})`}
              selected={s.id === studentId}
              onClick={() => setStudentId(s.id)}
            />
          ))}
        </div>
      </div>

      {student && (
        <div className="flex flex-col gap-6">
          {/* 공통 입력 */}
          <div className="rounded-2xl border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-900">공통 입력</h3>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                수업 일자
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900 focus:border-brand focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                출결·집중도
              </span>
              <StarRating value={focus} onChange={setFocus} />
            </div>

            <div className="mb-4">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                숙제 이행률
              </span>
              <div className="mb-3 flex flex-wrap gap-2">
                {HOMEWORK_PRESETS.map((p) => (
                  <Chip
                    key={p}
                    label={`${p}%`}
                    selected={homeworkRate === p}
                    onClick={() => setHomeworkRate(p)}
                  />
                ))}
              </div>
              <Slider value={homeworkRate} onChange={setHomeworkRate} />
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                오늘 테스트 점수
              </span>
              <div className="flex flex-col gap-3">
                {scoreSubjects.map((subj) => (
                  <div key={subj} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      {subj}
                    </span>
                    <Stepper
                      value={scores[subj]}
                      onChange={(v) => setScores({ ...scores, [subj]: v })}
                      min={0}
                      max={100}
                      step={1}
                      suffix="점"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 과목별 입력 */}
          <div className="rounded-2xl border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-900">과목별 입력</h3>

            {showKorean && showMath && (
              <div className="mb-4">
                <Segmented
                  options={['국어', '수학'] as const}
                  value={subTab}
                  onChange={setSubTab}
                />
              </div>
            )}

            {showKorean && (!showMath || subTab === '국어') && (
              <div className="flex flex-col gap-4">
                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    수업 영역
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {KOREAN_AREAS.map((area) => (
                      <Chip
                        key={area}
                        label={area}
                        selected={koreanAreas.includes(area)}
                        onClick={() => toggle(koreanAreas, setKoreanAreas, area)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    강점·약점 태그
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {KOREAN_TAGS.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        selected={koreanTags.includes(tag)}
                        onClick={() => toggle(koreanTags, setKoreanTags, tag)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showMath && (!showKorean || subTab === '수학') && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    진도 단원명
                  </label>
                  <input
                    type="text"
                    value={mathUnit}
                    onChange={(e) => setMathUnit(e.target.value)}
                    placeholder="예: 수열의 극한"
                    className="h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-900 focus:border-brand focus:outline-none"
                  />
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    개념 이해도
                  </span>
                  <Segmented
                    options={UNDERSTANDINGS}
                    value={mathUnderstanding}
                    onChange={setMathUnderstanding}
                  />
                </div>
                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    오답 원인
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {MATH_ERROR_CAUSES.map((cause) => (
                      <Chip
                        key={cause}
                        label={cause}
                        selected={mathErrorCauses.includes(cause)}
                        onClick={() =>
                          toggle(mathErrorCauses, setMathErrorCauses, cause)
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 총평 자동 작성 */}
          <div className="rounded-2xl border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-900">총평</h3>
            <Button onClick={handleCompose} variant="secondary" size="lg" fullWidth>
              <Sparkles size={18} />
              총평 자동 작성
            </Button>

            {composed && (
              <div className="mt-4 flex flex-col gap-2">
                {COMMENT_VERSIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectVersion(key)}
                    className={[
                      'min-h-[44px] rounded-xl border p-3 text-left text-sm transition-colors',
                      selectedVersion === key
                        ? 'border-brand bg-brand/5'
                        : 'border-slate-200 bg-white active:bg-slate-50',
                    ].join(' ')}
                  >
                    <span className="mb-1 block text-xs font-bold text-brand">
                      {label}
                    </span>
                    <span className="block text-slate-700">{composed[key]}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                총평 (직접 수정 가능)
              </label>
              <textarea
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                rows={5}
                placeholder="총평 자동 작성 버튼을 누르거나 직접 입력하세요."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          {/* 다음 시간 과제 */}
          <div className="rounded-2xl border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-900">다음 시간 과제</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              {ASSIGNMENT_PRESETS.map((a) => (
                <Chip
                  key={a}
                  label={a}
                  onClick={() =>
                    setNextAssignment((prev) =>
                      prev.trim() ? `${prev.trim()}, ${a}` : a,
                    )
                  }
                />
              ))}
            </div>
            <textarea
              value={nextAssignment}
              onChange={(e) => setNextAssignment(e.target.value)}
              rows={3}
              placeholder="칩을 눌러 추가하거나 직접 입력하세요."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-brand focus:outline-none"
            />
          </div>

          <Button onClick={handleSave} size="lg" fullWidth>
            <Save size={18} />
            리포트 저장
          </Button>
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
    </section>
  )
}

export default ReportBuilderTab
