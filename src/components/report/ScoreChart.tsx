// 최근 테스트 점수 추이 꺾은선 차트 (FEAT-004)
// 학생/과목별 최근 8회차 점수를 recharts LineChart 로 그립니다.
// 국수 동시 수강이면 국어와 수학을 별도 선으로 표시합니다.

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AppData, ScoreSubject, Student } from '../../types'
import { getLast8Scores } from '../../lib/storage'

interface ScoreChartProps {
  data: AppData
  student: Student
  /** 차트 높이(px). 모바일 카드에 맞춘 기본값. */
  height?: number
}

/** 날짜 라벨을 'M/D' 형태로 짧게 표시합니다. */
function shortDate(iso: string): string {
  const parts = iso.split('-')
  if (parts.length === 3) {
    return `${Number(parts[1])}/${Number(parts[2])}`
  }
  return iso
}

/** 학생 수강 과목으로부터 점수 과목 목록을 구합니다. */
function scoreSubjectsOf(student: Student): ScoreSubject[] {
  if (student.subjects === '국수') {
    return ['국어', '수학']
  }
  return [student.subjects]
}

interface ChartRow {
  date: string
  label: string
  국어?: number
  수학?: number
}

const LINE_COLORS: Record<ScoreSubject, string> = {
  국어: '#4f46e5',
  수학: '#0ea5e9',
}

/** 과목별 최근 8회차 점수를 날짜 기준으로 병합한 행 배열을 만듭니다. */
function buildRows(data: AppData, student: Student, subjects: ScoreSubject[]): ChartRow[] {
  const byDate = new Map<string, ChartRow>()
  for (const subject of subjects) {
    const scores = getLast8Scores(data, student.id, subject)
    for (const s of scores) {
      const existing = byDate.get(s.date)
      if (existing) {
        existing[subject] = s.score
      } else {
        byDate.set(s.date, { date: s.date, label: shortDate(s.date), [subject]: s.score })
      }
    }
  }
  return Array.from(byDate.values()).sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  )
}

function ScoreChart({ data, student, height = 200 }: ScoreChartProps) {
  const subjects = scoreSubjectsOf(student)
  const rows = buildRows(data, student, subjects)

  if (rows.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
        아직 기록된 테스트 점수가 없습니다.
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${value}점`, name]}
            labelFormatter={(label: string) => `테스트 ${label}`}
            contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {subjects.map((subject) => (
            <Line
              key={subject}
              type="monotone"
              dataKey={subject}
              name={subject}
              stroke={LINE_COLORS[subject]}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ScoreChart
