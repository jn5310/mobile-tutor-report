// 학부모님께 보내는 리포트 카드
// 종이 성적표처럼 보이도록 구성합니다: 머리말 -> 핵심 숫자 -> 점수 추이 -> 과목 분석 -> 총평 -> 과제 -> 서명.
// html-to-image 로 캡처할 수 있도록 forwardRef 로 고정 폭(360px) 컨테이너를 노출합니다.

import { forwardRef, ReactNode } from 'react'
import { AppData, Report, ScoreSubject, Student } from '../../types'
import { getLast8Scores } from '../../lib/storage'
import { KOREAN_TAG_NOTES, KoreanTag } from '../../data/feedbackTemplates'
import ScoreChart from './ScoreChart'
import ErrorRatioBar from './ErrorRatioBar'

interface ReportCardProps {
  data: AppData
  report: Report
  student: Student
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function formatKoreanDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) {
    return iso
  }
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`
}

/** 과제 문자열을 줄/쉼표 단위 항목으로 나눕니다. */
export function splitAssignments(text: string): string[] {
  return text
    .split(/\n|,(?![^()]*\))/)
    .map((s) => s.replace(/^[-·•\s]+/, '').trim())
    .filter(Boolean)
}

function Block({ title, color, children }: { title: string; color?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line px-5 py-4">
      <h4 className="mb-2.5 text-[12px] font-bold tracking-wide" style={{ color: color ?? '#5F5B53' }}>
        {title}
      </h4>
      {children}
    </section>
  )
}

const ReportCard = forwardRef<HTMLDivElement, ReportCardProps>(function ReportCard({ data, report, student }, ref) {
  const showKorean = student.subjects === '국어' || student.subjects === '국수'
  const showMath = student.subjects === '수학' || student.subjects === '국수'

  const strengths = report.koreanTags.filter((t) => KOREAN_TAG_NOTES[t as KoreanTag]?.kind !== 'weakness')
  const weaknesses = report.koreanTags.filter((t) => KOREAN_TAG_NOTES[t as KoreanTag]?.kind === 'weakness')
  const hasKorean = showKorean && (report.koreanAreas.length > 0 || report.koreanTags.length > 0)
  const hasMath =
    showMath && (report.mathUnit.trim().length > 0 || report.mathErrorCauses.length > 0)

  const previousOf = (subject: ScoreSubject): number | undefined => {
    const hist = getLast8Scores(
      { ...data, reports: data.reports.filter((r) => r.id !== report.id) },
      student.id,
      subject,
    ).filter((s) => s.date < report.date)
    return hist.length > 0 ? hist[hist.length - 1].score : undefined
  }

  const teacher = data.settings?.teacherName?.trim()
  const academy = data.settings?.academyName?.trim()
  const assignments = splitAssignments(report.nextAssignment)
  const target = [student.targetUniversity, student.targetGrade].filter((v) => v && v.trim()).join(' · ')

  return (
    <div
      ref={ref}
      data-shot="report-card"
      style={{ width: 360 }}
      className="mx-auto overflow-hidden rounded-sm border border-line bg-white text-ink"
    >
      {/* 머리말 */}
      <header className="px-5 pb-4 pt-5">
        <div className="flex items-center justify-between text-[12px] text-ink-soft">
          <span className="font-semibold tracking-wide">주간 학습 리포트</span>
          <span>{academy || ''}</span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <h3 className="text-[26px] font-bold leading-none">{student.name}</h3>
          <span className="text-[13px] text-ink-soft">
            {student.grade} · {student.subjects === '국수' ? '국어·수학' : student.subjects}
          </span>
        </div>
        <p className="mt-2 text-[13px] text-ink-soft">{formatKoreanDate(report.date)} 수업</p>
        {target && <p className="mt-0.5 text-[13px] text-ink-soft">목표 {target}</p>}
      </header>

      {/* 핵심 숫자 */}
      <div className="grid grid-cols-3 border-t border-line bg-paper/60 text-center">
        <div className="px-1 py-3">
          <div className="text-2xs text-ink-soft">테스트</div>
          {report.testScores.length === 0 ? (
            <div className="mt-1 text-[15px] text-ink-mute">-</div>
          ) : (
            report.testScores.map((t) => {
              const prev = previousOf(t.subject)
              const diff = typeof prev === 'number' ? t.score - prev : null
              return (
                <div key={t.subject} className="tabular mt-0.5 leading-tight">
                  {report.testScores.length > 1 && (
                    <span className="mr-1 text-2xs" style={{ color: t.subject === '국어' ? '#9A3B2E' : '#2B4C7E' }}>
                      {t.subject}
                    </span>
                  )}
                  <span className="text-[19px] font-bold">{t.score}</span>
                  <span className="text-[12px]">점</span>
                  {diff !== null && diff !== 0 && (
                    <span className={['ml-1 text-[12px] font-semibold', diff > 0 ? 'text-brand' : 'text-kor'].join(' ')}>
                      {diff > 0 ? `▲${diff}` : `▼${-diff}`}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
        <div className="border-x border-line px-1 py-3">
          <div className="text-2xs text-ink-soft">숙제</div>
          <div className="tabular mt-0.5 text-[19px] font-bold">
            {report.homeworkRate}
            <span className="text-[12px] font-normal">%</span>
          </div>
        </div>
        <div className="px-1 py-3">
          <div className="text-2xs text-ink-soft">수업 태도</div>
          <div className="mt-1 text-[15px] tracking-tight" style={{ color: '#C9922E' }}>
            {'★'.repeat(report.attendanceFocus)}
            <span className="text-line">{'★'.repeat(Math.max(0, 5 - report.attendanceFocus))}</span>
          </div>
        </div>
      </div>

      <Block title="최근 테스트 점수">
        <ScoreChart data={data} student={student} height={150} untilDate={report.date} />
      </Block>

      {hasKorean && (
        <Block title="국어" color="#9A3B2E">
          {report.koreanAreas.length > 0 && (
            <p className="mb-2 text-[14px]">
              <span className="mr-2 text-[12px] text-ink-soft">수업 영역</span>
              {report.koreanAreas.join(' · ')}
            </p>
          )}
          {strengths.length > 0 && (
            <ul className="space-y-1 text-[14px]">
              {strengths.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="w-3 shrink-0 text-center text-brand">○</span>
                  {t}
                </li>
              ))}
            </ul>
          )}
          {weaknesses.length > 0 && (
            <ul className={['space-y-1 text-[14px]', strengths.length > 0 ? 'mt-1' : ''].join(' ')}>
              {weaknesses.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="w-3 shrink-0 text-center text-kor">△</span>
                  {t}
                </li>
              ))}
            </ul>
          )}
        </Block>
      )}

      {hasMath && (
        <Block title="수학" color="#2B4C7E">
          <p className="mb-3 flex items-baseline justify-between text-[14px]">
            <span>
              <span className="mr-2 text-[12px] text-ink-soft">진도</span>
              {report.mathUnit.trim() || '-'}
            </span>
            <span className="text-[13px] text-ink-soft">
              개념 이해도 <b className="text-math">{report.mathUnderstanding}</b>
            </span>
          </p>
          {report.mathErrorCauses.length > 0 && (
            <>
              <p className="mb-1.5 text-[12px] text-ink-soft">오답 원인</p>
              <ErrorRatioBar counts={report.mathErrorCounts ?? {}} fallbackCauses={report.mathErrorCauses} />
            </>
          )}
        </Block>
      )}

      {report.overallComment.trim() && (
        <Block title="선생님 총평">
          <p className="whitespace-pre-wrap text-[14px] leading-[1.75]">{report.overallComment}</p>
        </Block>
      )}

      {assignments.length > 0 && (
        <Block title="다음 시간까지">
          <ul className="space-y-1.5 text-[14px]">
            {assignments.map((a, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-[3px] inline-block h-3.5 w-3.5 shrink-0 rounded-[2px] border border-ink-soft" />
                {a}
              </li>
            ))}
          </ul>
        </Block>
      )}

      <footer className="flex items-center justify-between border-t border-line px-5 py-3 text-[12px] text-ink-soft">
        <span>{formatKoreanDate(report.date).replace(/ \(.\)$/, '')}</span>
        <span className="font-semibold text-ink">{teacher ? `${teacher} 선생님 드림` : '담당 선생님 드림'}</span>
      </footer>
    </div>
  )
})

export default ReportCard
