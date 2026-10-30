// 수학 오답 원인 비율 막대
// 원인별 틀린 문항 수를 하나의 가로 막대로 쌓아 보여 주고, 아래에 비율(%)을 적습니다.
// 리포트 작성 화면과 리포트 카드(이미지 저장) 양쪽에서 씁니다.

import { MATH_ERROR_CAUSES } from '../../data/feedbackTemplates'

// 남색 계열 농도 차이로 원인을 구분합니다.
const SHADES = ['#2B4C7E', '#5674A3', '#8BA3C7', '#B9C8DE', '#DCE4EF']

interface ErrorRatioBarProps {
  counts: Record<string, number>
  /** 개수 없이 원인만 있는 예전 리포트용: 모두 1문항으로 봅니다. */
  fallbackCauses?: string[]
}

export function ratioRows(counts: Record<string, number>, fallbackCauses: string[] = []) {
  const merged: Record<string, number> = { ...counts }
  for (const c of fallbackCauses) {
    if (!merged[c]) {
      merged[c] = 1
    }
  }
  const order: string[] = [...MATH_ERROR_CAUSES, ...Object.keys(merged)].filter(
    (c, i, arr) => arr.indexOf(c) === i,
  )
  const rows = order
    .map((cause) => ({ cause, count: merged[cause] ?? 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
  const total = rows.reduce((s, r) => s + r.count, 0)
  return {
    total,
    rows: rows.map((r, i) => ({
      ...r,
      pct: total > 0 ? Math.round((r.count / total) * 100) : 0,
      color: SHADES[i % SHADES.length],
    })),
  }
}

function ErrorRatioBar({ counts, fallbackCauses }: ErrorRatioBarProps) {
  const { total, rows } = ratioRows(counts, fallbackCauses)
  if (total === 0) {
    return null
  }
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-sm bg-line">
        {rows.map((r) => (
          <div key={r.cause} style={{ width: `${(r.count / total) * 100}%`, backgroundColor: r.color }} />
        ))}
      </div>
      <ul className="mt-2 space-y-1">
        {rows.map((r) => (
          <li key={r.cause} className="flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2 text-ink">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: r.color }} />
              {r.cause}
            </span>
            <span className="tabular text-ink-soft">
              {r.count}문항 · <span className="font-semibold text-ink">{r.pct}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ErrorRatioBar
