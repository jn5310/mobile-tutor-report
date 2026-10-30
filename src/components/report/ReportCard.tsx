// 모바일 카드뉴스 리포트 카드 (FEAT-004)
// 학부모님 스마트폰에서 한눈에 보기 좋은 리포트 카드를 렌더링합니다.
// html-to-image 로 캡처할 수 있도록 forwardRef 로 고정 폭 컨테이너를 노출합니다.

import { forwardRef } from 'react'
import { AppData, Report, Student } from '../../types'
import ScoreChart from './ScoreChart'

interface ReportCardProps {
  data: AppData
  report: Report
  student: Student
}

/** ISO 날짜를 'YYYY년 M월 D일'로 표시합니다. */
function formatKoreanDate(iso: string): string {
  const parts = iso.split('-')
  if (parts.length === 3) {
    return `${parts[0]}년 ${Number(parts[1])}월 ${Number(parts[2])}일`
  }
  return iso
}

/** 정보 행 라벨/값. */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="w-14 shrink-0 font-semibold text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  )
}

/** 섹션 제목. */
function SectionTitle({ children }: { children: string }) {
  return (
    <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-brand">
      <span className="inline-block h-4 w-1 rounded-full bg-brand" />
      {children}
    </h4>
  )
}

const ReportCard = forwardRef<HTMLDivElement, ReportCardProps>(function ReportCard(
  { data, report, student },
  ref,
) {
  const showKorean = student.subjects === '국어' || student.subjects === '국수'
  const showMath = student.subjects === '수학' || student.subjects === '국수'

  const hasKoreanAnalysis =
    showKorean && (report.koreanAreas.length > 0 || report.koreanTags.length > 0)
  const hasMathAnalysis =
    showMath &&
    (report.mathUnit.trim().length > 0 ||
      report.mathErrorCauses.length > 0 ||
      report.mathUnderstanding.length > 0)

  return (
    <div
      ref={ref}
      style={{ width: 360 }}
      className="mx-auto overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"
    >
      {/* 헤더 */}
      <div className="bg-brand px-5 py-5 text-white">
        <p className="text-xs font-semibold opacity-90">주간 학습 리포트</p>
        <h3 className="mt-1 text-2xl font-extrabold">{student.name} 학생</h3>
        <p className="mt-1 text-sm opacity-90">{formatKoreanDate(report.date)}</p>
      </div>

      <div className="flex flex-col gap-5 px-5 py-5">
        {/* 학생 정보 */}
        <section>
          <SectionTitle>학생 정보</SectionTitle>
          <div className="flex flex-col gap-1.5 rounded-2xl bg-slate-50 p-3">
            <InfoRow label="학년" value={student.grade} />
            <InfoRow label="과목" value={student.subjects} />
            <InfoRow
              label="목표"
              value={[student.targetUniversity, student.targetGrade]
                .filter((v) => v && v.trim())
                .join(' · ')}
            />
          </div>
        </section>

        {/* 점수 추이 */}
        <section>
          <SectionTitle>최근 테스트 점수 추이</SectionTitle>
          <ScoreChart data={data} student={student} height={180} />
        </section>

        {/* 국어 영역 분석 */}
        {hasKoreanAnalysis && (
          <section>
            <SectionTitle>국어 영역 분석</SectionTitle>
            <div className="flex flex-col gap-2 text-sm">
              {report.koreanAreas.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {report.koreanAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
              {report.koreanTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {report.koreanTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 수학 오답 원인 */}
        {hasMathAnalysis && (
          <section>
            <SectionTitle>수학 오답 원인 분석</SectionTitle>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                {report.mathUnit.trim() && (
                  <span className="font-semibold text-slate-900">{report.mathUnit}</span>
                )}
                <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
                  이해도 {report.mathUnderstanding}
                </span>
              </div>
              {report.mathErrorCauses.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {report.mathErrorCauses.map((cause) => (
                    <span
                      key={cause}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {cause}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 선생님 총평 */}
        {report.overallComment.trim() && (
          <section>
            <SectionTitle>선생님 총평</SectionTitle>
            <p className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
              {report.overallComment}
            </p>
          </section>
        )}

        {/* 다음 시간 과제 */}
        {report.nextAssignment.trim() && (
          <section>
            <SectionTitle>다음 시간 과제</SectionTitle>
            <p className="whitespace-pre-wrap rounded-2xl bg-brand/5 p-3 text-sm leading-relaxed text-slate-800">
              {report.nextAssignment}
            </p>
          </section>
        )}
      </div>

      <div className="border-t border-slate-100 px-5 py-3 text-center text-xs text-slate-400">
        과외 리포트 생성기로 작성되었습니다.
      </div>
    </div>
  )
})

export default ReportCard
