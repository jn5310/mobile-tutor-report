// 히스토리 탭 (FEAT-004)
// 학생을 선택하면 누적된 과거 리포트를 최신순으로 보여 주고,
// 최근 8회차 점수 추이 차트와 점수 변화(델타) 표로 이전 기록을 비교할 수 있습니다.
// 각 리포트를 눌러 리포트 미리보기(카드 + 공유)로 열 수 있습니다.

import { useMemo, useState } from 'react'
import { Clock, FileText } from 'lucide-react'
import { Report, ScoreSubject, Student } from '../../types'
import { getLast8Scores, getReportsByStudent } from '../../lib/storage'
import Chip from '../ui/Chip'
import ScoreChart from '../report/ScoreChart'
import ReportPreview from '../report/ReportPreview'
import { TabProps } from './types'

/** ISO 날짜를 'YYYY.MM.DD' 로 표시합니다. */
function dotDate(iso: string): string {
  const parts = iso.split('-')
  if (parts.length === 3) {
    return `${parts[0]}.${parts[1]}.${parts[2]}`
  }
  return iso
}

/** 리포트 1건의 짧은 요약 문자열을 만듭니다. */
function shortSummary(report: Report): string {
  const bits: string[] = []
  if (report.testScores.length > 0) {
    bits.push(report.testScores.map((t) => `${t.subject} ${t.score}점`).join(' / '))
  }
  if (report.koreanAreas.length > 0) {
    bits.push(report.koreanAreas.slice(0, 2).join(', '))
  }
  if (report.mathUnit.trim()) {
    bits.push(report.mathUnit.trim())
  }
  return bits.length > 0 ? bits.join(' · ') : '점수 기록 없음'
}

/** 학생 수강 과목으로부터 점수 과목 목록을 구합니다. */
function scoreSubjectsOf(student: Student): ScoreSubject[] {
  if (student.subjects === '국수') {
    return ['국어', '수학']
  }
  return [student.subjects]
}

interface DeltaRow {
  subject: ScoreSubject
  date: string
  score: number
  delta: number | null
}

/** 과목별 최근 8회차 점수와 직전 대비 변화량을 계산합니다. */
function buildDeltaRows(
  data: TabProps['data'],
  student: Student,
): DeltaRow[] {
  const rows: DeltaRow[] = []
  for (const subject of scoreSubjectsOf(student)) {
    const scores = getLast8Scores(data, student.id, subject)
    scores.forEach((s, i) => {
      rows.push({
        subject,
        date: s.date,
        score: s.score,
        delta: i === 0 ? null : s.score - scores[i - 1].score,
      })
    })
  }
  return rows
}

function HistoryTab({ data }: TabProps) {
  const [studentId, setStudentId] = useState<string | null>(
    data.students[0]?.id ?? null,
  )
  const [previewReport, setPreviewReport] = useState<Report | null>(null)

  const student = useMemo(
    () => data.students.find((s) => s.id === studentId) ?? null,
    [data.students, studentId],
  )

  const reports = useMemo(
    () => (student ? getReportsByStudent(data, student.id) : []),
    [data, student],
  )

  const deltaRows = useMemo(
    () => (student ? buildDeltaRows(data, student) : []),
    [data, student],
  )

  if (data.students.length === 0) {
    return (
      <section className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Clock size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">히스토리</h2>
        <p className="text-sm text-slate-500">
          먼저 학생 관리 탭에서 학생을 등록해 주세요.
        </p>
      </section>
    )
  }

  return (
    <section className="px-4 py-4">
      <h2 className="mb-4 text-lg font-bold text-slate-900">히스토리</h2>

      {/* 학생 선택 */}
      <div className="mb-5">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">학생 선택</span>
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
          {/* 점수 추이 차트 */}
          <div className="rounded-2xl border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-900">최근 8회차 점수 추이</h3>
            <ScoreChart data={data} student={student} />
          </div>

          {/* 점수 변화 비교 표 */}
          {deltaRows.length > 0 && (
            <div className="rounded-2xl border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-bold text-slate-900">점수 변화 비교</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="py-2 pr-2 font-semibold">과목</th>
                      <th className="py-2 pr-2 font-semibold">일자</th>
                      <th className="py-2 pr-2 font-semibold">점수</th>
                      <th className="py-2 font-semibold">변화</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deltaRows.map((row, idx) => (
                      <tr key={`${row.subject}-${row.date}-${idx}`} className="border-b border-slate-100">
                        <td className="py-2 pr-2 font-medium text-slate-700">{row.subject}</td>
                        <td className="py-2 pr-2 text-slate-500">{dotDate(row.date)}</td>
                        <td className="py-2 pr-2 font-semibold text-slate-900">{row.score}점</td>
                        <td className="py-2">
                          {row.delta === null ? (
                            <span className="text-slate-400">-</span>
                          ) : row.delta > 0 ? (
                            <span className="font-semibold text-emerald-600">▲ {row.delta}</span>
                          ) : row.delta < 0 ? (
                            <span className="font-semibold text-red-500">▼ {Math.abs(row.delta)}</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 누적 리포트 목록 */}
          <div className="rounded-2xl border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              지난 리포트 ({reports.length}건)
            </h3>
            {reports.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">
                아직 저장된 리포트가 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {reports.map((report) => (
                  <li key={report.id}>
                    <button
                      type="button"
                      onClick={() => setPreviewReport(report)}
                      className="flex min-h-[56px] w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors active:bg-slate-50"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <FileText size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900">
                          {dotDate(report.date)}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {shortSummary(report)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {previewReport && student && (
        <ReportPreview
          data={data}
          report={previewReport}
          student={student}
          onClose={() => setPreviewReport(null)}
        />
      )}
    </section>
  )
}

export default HistoryTab
