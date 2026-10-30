// 히스토리 탭
// 학생을 고르면 최근 8회 점수 추이, 회차별 점수 변화, 지난 리포트 목록을 보여 줍니다.
// 리포트를 누르면 미리보기(카드 + 보내기)로 열리고, 그 자리에서 고치거나 지울 수 있습니다.

import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Report, ScoreSubject, Student } from '../../types'
import { deleteReport, getLast8Scores, getReportsByStudent } from '../../lib/storage'
import Button from '../ui/Button'
import ScoreChart from '../report/ScoreChart'
import ReportPreview from '../report/ReportPreview'
import StudentPicker from '../StudentPicker'
import { TabProps } from './types'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function rowDate(iso: string): { md: string; wd: string } {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) {
    return { md: iso, wd: '' }
  }
  return { md: `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}`, wd: WEEKDAYS[d.getDay()] }
}

function scoreSubjectsOf(student: Student): ScoreSubject[] {
  return student.subjects === '국수' ? ['국어', '수학'] : [student.subjects]
}

interface SubjectStats {
  subject: ScoreSubject
  rows: { date: string; score: number; delta: number | null }[]
  avg: number
  best: number
  latest: number
  first: number
}

function buildStats(data: TabProps['data'], student: Student): SubjectStats[] {
  const out: SubjectStats[] = []
  for (const subject of scoreSubjectsOf(student)) {
    const scores = getLast8Scores(data, student.id, subject)
    if (scores.length === 0) {
      continue
    }
    const vals = scores.map((s) => s.score)
    out.push({
      subject,
      rows: scores.map((s, i) => ({ date: s.date, score: s.score, delta: i === 0 ? null : s.score - scores[i - 1].score })),
      avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      best: Math.max(...vals),
      latest: vals[vals.length - 1],
      first: vals[0],
    })
  }
  return out
}

function Delta({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-ink-mute">-</span>
  }
  if (value === 0) {
    return <span className="text-ink-mute">0</span>
  }
  return (
    <span className={['font-semibold', value > 0 ? 'text-brand' : 'text-kor'].join(' ')}>
      {value > 0 ? `+${value}` : value}
    </span>
  )
}

function summaryOf(report: Report): string {
  const comment = report.overallComment.replace(/^안녕하세요[^.]*\.\s*/, '').trim()
  if (comment) {
    return comment
  }
  const bits = [...report.koreanAreas.slice(0, 2), report.mathUnit.trim()].filter(Boolean)
  return bits.length > 0 ? bits.join(' · ') : '점수만 기록'
}

function HistoryTab({ data, setData, studentId, setStudentId, goTo, setEditReportId }: TabProps) {
  const [previewReport, setPreviewReport] = useState<Report | null>(null)

  const student = useMemo(() => data.students.find((s) => s.id === studentId) ?? null, [data.students, studentId])
  const reports = useMemo(() => (student ? getReportsByStudent(data, student.id) : []), [data, student])
  const stats = useMemo(() => (student ? buildStats(data, student) : []), [data, student])

  if (data.students.length === 0) {
    return (
      <section className="px-4 pt-5">
        <h2 className="text-[22px] font-bold text-ink">히스토리</h2>
        <div className="mt-4 rounded border border-line bg-white px-5 py-8">
          <p className="text-[15px] text-ink">학생을 등록하고 리포트를 저장하면 여기에 쌓입니다.</p>
          <div className="mt-4">
            <Button onClick={() => goTo('students')} variant="secondary" fullWidth>
              학생 관리로 가기
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const handleDelete = (r: Report) => {
    if (window.confirm(`${r.date} 리포트를 삭제할까요? 되돌릴 수 없습니다.`)) {
      setData(deleteReport(data, r.id))
      setPreviewReport(null)
    }
  }

  const handleEdit = (r: Report) => {
    setPreviewReport(null)
    setEditReportId(r.id)
    goTo('report', r.studentId)
  }

  return (
    <div className="pb-4">
      <div className="px-4 pb-3 pt-5">
        <h2 className="text-[22px] font-bold text-ink">히스토리</h2>
        <p className="mt-0.5 text-sm text-ink-soft">최근 8회 점수와 지난 리포트를 모아 봅니다</p>
      </div>

      <StudentPicker students={data.students} value={studentId} onChange={setStudentId} />

      {student && (
        <div className="flex flex-col gap-3">
          <section className="sheet">
            <div className="section-label">
              <span className="text-[15px]">점수 추이</span>
            </div>
            <ScoreChart data={data} student={student} height={180} />

            {stats.length > 0 && (
              <div className={['mt-4 grid gap-2', stats.length > 1 ? 'grid-cols-2' : 'grid-cols-1'].join(' ')}>
                {stats.map((s) => (
                  <div key={s.subject} className="rounded border border-line px-3 py-2.5">
                    <div className={['mb-1.5 text-[13px] font-semibold', s.subject === '국어' ? 'text-kor' : 'text-math'].join(' ')}>
                      {s.subject} · {s.rows.length}회
                    </div>
                    <dl className="tabular grid grid-cols-3 text-center">
                      <div>
                        <dt className="text-2xs text-ink-mute">평균</dt>
                        <dd className="text-[17px] font-bold text-ink">{s.avg}</dd>
                      </div>
                      <div>
                        <dt className="text-2xs text-ink-mute">최고</dt>
                        <dd className="text-[17px] font-bold text-ink">{s.best}</dd>
                      </div>
                      <div>
                        <dt className="text-2xs text-ink-mute">처음 대비</dt>
                        <dd className="text-[17px]">
                          <Delta value={s.rows.length > 1 ? s.latest - s.first : null} />
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </section>

          {stats.length > 0 && (
            <section className="sheet">
              <div className="section-label">
                <span className="text-[15px]">회차별 점수</span>
              </div>
              <table className="tabular w-full text-[14px]">
                <thead>
                  <tr className="border-b border-line text-left text-[12px] text-ink-mute">
                    <th className="pb-2 font-normal">날짜</th>
                    {stats.map((s) => (
                      <th key={s.subject} className="pb-2 text-right font-normal" colSpan={2}>
                        {s.subject}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(stats.flatMap((s) => s.rows.map((r) => r.date))))
                    .sort()
                    .reverse()
                    .map((date) => {
                      const { md, wd } = rowDate(date)
                      return (
                        <tr key={date} className="border-b border-line/70 last:border-b-0">
                          <td className="py-2 text-ink-soft">
                            {md} <span className="text-2xs">{wd}</span>
                          </td>
                          {stats.map((s) => {
                            const row = s.rows.find((r) => r.date === date)
                            return [
                              <td key={`${s.subject}-v`} className="py-2 pr-2 text-right font-semibold text-ink">
                                {row ? row.score : <span className="font-normal text-ink-mute">-</span>}
                              </td>,
                              <td key={`${s.subject}-d`} className="w-10 py-2 text-right text-[13px]">
                                {row ? <Delta value={row.delta} /> : null}
                              </td>,
                            ]
                          })}
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </section>
          )}

          <section className="sheet !px-0 !pb-0">
            <div className="section-label px-4">
              <span className="text-[15px]">지난 리포트</span>
              <span className="tabular text-[13px] font-normal text-ink-mute">{reports.length}건</span>
            </div>
            {reports.length === 0 ? (
              <p className="px-4 pb-6 text-sm text-ink-mute">아직 저장된 리포트가 없습니다.</p>
            ) : (
              <ul className="border-t border-line">
                {reports.map((report) => {
                  const { md, wd } = rowDate(report.date)
                  return (
                    <li key={report.id} className="border-b border-line last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setPreviewReport(report)}
                        className="flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left active:bg-paper"
                      >
                        <span className="tabular w-11 shrink-0 text-center leading-tight">
                          <span className="block text-[15px] font-bold text-ink">{md}</span>
                          <span className="block text-2xs text-ink-mute">{wd}요일</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="tabular block text-[14px] text-ink">
                            {report.testScores.length > 0
                              ? report.testScores.map((t) => `${t.subject} ${t.score}점`).join(' · ')
                              : '시험 없음'}
                            <span className="ml-2 text-[12px] text-ink-mute">숙제 {report.homeworkRate}%</span>
                          </span>
                          <span className="mt-0.5 block truncate text-[13px] text-ink-soft">{summaryOf(report)}</span>
                        </span>
                        <ChevronRight size={18} className="shrink-0 text-ink-mute" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {previewReport && student && (
        <ReportPreview
          data={data}
          report={previewReport}
          student={student}
          onClose={() => setPreviewReport(null)}
          onEdit={() => handleEdit(previewReport)}
          onDelete={() => handleDelete(previewReport)}
        />
      )}
    </div>
  )
}

export default HistoryTab
