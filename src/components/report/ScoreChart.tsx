// 최근 테스트 점수 추이 꺾은선 차트
// 학생/과목별 최근 8회차 점수를 SVG 로 직접 그립니다 (차트 라이브러리 없이 가볍게).
// 국수 동시 수강이면 국어와 수학을 각각의 선으로 그립니다.
// 점마다 점수를 적어 학부모님이 숫자를 바로 읽을 수 있게 합니다.

import { AppData, ScoreSubject, Student, TestScore } from '../../types'
import { getLast8Scores } from '../../lib/storage'

interface ScoreChartProps {
  data: AppData
  student: Student
  /** 차트 높이(px). */
  height?: number
  /** 이 날짜 이후 점수는 그리지 않습니다 (과거 리포트를 볼 때 그 시점 기준으로 보기). */
  untilDate?: string
}

const COLORS: Record<ScoreSubject, string> = {
  국어: '#9A3B2E',
  수학: '#2B4C7E',
}

function shortDate(iso: string): string {
  const parts = iso.split('-')
  return parts.length === 3 ? `${Number(parts[1])}/${Number(parts[2])}` : iso
}

function scoreSubjectsOf(student: Student): ScoreSubject[] {
  return student.subjects === '국수' ? ['국어', '수학'] : [student.subjects]
}

const W = 320
const PAD_L = 26
const PAD_R = 14
const PAD_T = 22
const PAD_B = 24

function ScoreChart({ data, student, height = 170, untilDate }: ScoreChartProps) {
  const subjects = scoreSubjectsOf(student)
  const series: { subject: ScoreSubject; points: TestScore[] }[] = subjects.map((subject) => {
    const scoped = untilDate
      ? { ...data, reports: data.reports.filter((r) => r.date <= untilDate) }
      : data
    return { subject, points: getLast8Scores(scoped, student.id, subject) }
  })

  const dates = Array.from(new Set(series.flatMap((s) => s.points.map((p) => p.date)))).sort()
  const all = series.flatMap((s) => s.points.map((p) => p.score))

  if (dates.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded border border-dashed border-line text-[13px] text-ink-mute">
        아직 기록된 테스트 점수가 없습니다.
      </div>
    )
  }

  const H = height
  const minScore = Math.min(...all)
  const lo = Math.max(0, Math.floor((minScore - 10) / 10) * 10)
  const hi = 100
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B
  const x = (i: number) => (dates.length === 1 ? PAD_L + plotW / 2 : PAD_L + (plotW * i) / (dates.length - 1))
  const y = (v: number) => PAD_T + plotH - ((v - lo) / (hi - lo)) * plotH
  const grid = [lo, Math.round((lo + hi) / 2 / 10) * 10, hi].filter((v, i, a) => a.indexOf(v) === i)
  const twoLines = series.length > 1

  return (
    <div>
      {twoLines && (
        <div className="mb-1 flex gap-4 text-[12px] text-ink-soft">
          {series.map((s) => (
            <span key={s.subject} className="flex items-center gap-1.5">
              <span className="inline-block h-[2px] w-4" style={{ backgroundColor: COLORS[s.subject] }} />
              {s.subject}
            </span>
          ))}
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`최근 ${dates.length}회 점수 추이`}
        style={{ display: 'block', fontFamily: 'inherit' }}
      >
        {grid.map((g) => (
          <g key={g}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(g)} y2={y(g)} stroke="#E3DED3" strokeWidth={1} />
            <text x={PAD_L - 6} y={y(g) + 3.5} fontSize={10} textAnchor="end" fill="#9B968B">
              {g}
            </text>
          </g>
        ))}

        {dates.map((d, i) => (
          <text key={d} x={x(i)} y={H - 6} fontSize={10} textAnchor="middle" fill="#9B968B">
            {shortDate(d)}
          </text>
        ))}

        {series.map((s, si) => {
          const pts = s.points.map((p) => ({ cx: x(dates.indexOf(p.date)), cy: y(p.score), v: p.score }))
          const color = COLORS[s.subject]
          // 두 선의 점수 글자가 겹치지 않도록 수학은 아래쪽에 적습니다.
          const labelBelow = twoLines && si === 1
          return (
            <g key={s.subject}>
              {pts.length > 1 && (
                <polyline
                  points={pts.map((p) => `${p.cx},${p.cy}`).join(' ')}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
              {pts.map((p, i) => {
                const last = i === pts.length - 1
                return (
                  <g key={i}>
                    <circle cx={p.cx} cy={p.cy} r={last ? 4.5 : 3} fill={last ? color : '#fff'} stroke={color} strokeWidth={2} />
                    <text
                      x={p.cx}
                      y={labelBelow ? p.cy + 15 : p.cy - 9}
                      fontSize={last ? 12 : 10}
                      fontWeight={last ? 700 : 500}
                      textAnchor="middle"
                      fill={last ? color : '#5F5B53'}
                    >
                      {p.v}
                    </text>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default ScoreChart
