// 과목 표시 태그: 국어 = 주묵색, 수학 = 남색, 국수 = 두 색을 나란히.

import { Subject } from '../../types'

function Pill({ label, kind }: { label: string; kind: 'kor' | 'math' }) {
  return (
    <span
      className={[
        'inline-flex h-[22px] items-center px-1.5 text-[12px] font-semibold',
        kind === 'kor' ? 'bg-kor-tint text-kor' : 'bg-math-tint text-math',
      ].join(' ')}
    >
      {label}
    </span>
  )
}

function SubjectTag({ subject }: { subject: Subject }) {
  if (subject === '국수') {
    return (
      <span className="inline-flex overflow-hidden rounded-sm">
        <Pill label="국어" kind="kor" />
        <Pill label="수학" kind="math" />
      </span>
    )
  }
  return (
    <span className="inline-flex overflow-hidden rounded-sm">
      <Pill label={subject} kind={subject === '국어' ? 'kor' : 'math'} />
    </span>
  )
}

export default SubjectTag
