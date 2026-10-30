// 공유 유틸리티 (FEAT-004)
// 카카오톡 텍스트 복사, 리포트 카드 PNG 변환, Web Share API 공유, PNG 다운로드를 담당합니다.

import { toBlob } from 'html-to-image'
import { Report, Student } from '../types'

/** ISO 날짜를 'YYYY.MM.DD' 로 표시합니다. */
function dotDate(iso: string): string {
  const parts = iso.split('-')
  if (parts.length === 3) {
    return `${parts[0]}.${parts[1]}.${parts[2]}`
  }
  return iso
}

/**
 * 학생/리포트 정보를 이모지와 말머리가 깔끔하게 정리된 카카오톡 메시지 텍스트로 변환합니다.
 */
export function toKakaoText(report: Report, student: Student): string {
  const lines: string[] = []
  const showKorean = student.subjects === '국어' || student.subjects === '국수'
  const showMath = student.subjects === '수학' || student.subjects === '국수'

  lines.push(`📘 ${student.name} 학생 주간 학습 리포트`)
  lines.push(`🗓️ ${dotDate(report.date)}`)
  lines.push('')

  // 학생 정보
  lines.push('👤 학생 정보')
  lines.push(`• 학년: ${student.grade}`)
  lines.push(`• 과목: ${student.subjects}`)
  const target = [student.targetUniversity, student.targetGrade]
    .filter((v) => v && v.trim())
    .join(' · ')
  if (target) {
    lines.push(`• 목표: ${target}`)
  }
  lines.push('')

  // 테스트 점수
  if (report.testScores.length > 0) {
    lines.push('📈 이번 회차 테스트 점수')
    for (const ts of report.testScores) {
      lines.push(`• ${ts.subject}: ${ts.score}점`)
    }
    lines.push('')
  }

  // 국어 분석
  if (showKorean && (report.koreanAreas.length > 0 || report.koreanTags.length > 0)) {
    lines.push('📖 국어 영역 분석')
    if (report.koreanAreas.length > 0) {
      lines.push(`• 수업 영역: ${report.koreanAreas.join(', ')}`)
    }
    if (report.koreanTags.length > 0) {
      lines.push(`• 강점·약점: ${report.koreanTags.join(', ')}`)
    }
    lines.push('')
  }

  // 수학 분석
  if (
    showMath &&
    (report.mathUnit.trim() || report.mathErrorCauses.length > 0)
  ) {
    lines.push('✏️ 수학 오답 원인 분석')
    if (report.mathUnit.trim()) {
      lines.push(`• 단원: ${report.mathUnit.trim()} (이해도 ${report.mathUnderstanding})`)
    }
    if (report.mathErrorCauses.length > 0) {
      lines.push(`• 오답 원인: ${report.mathErrorCauses.join(', ')}`)
    }
    lines.push('')
  }

  // 총평
  if (report.overallComment.trim()) {
    lines.push('💬 선생님 총평')
    lines.push(report.overallComment.trim())
    lines.push('')
  }

  // 다음 과제
  if (report.nextAssignment.trim()) {
    lines.push('📌 다음 시간 과제')
    lines.push(report.nextAssignment.trim())
    lines.push('')
  }

  // 마무리 (끝 공백 줄 정리)
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop()
  }

  return lines.join('\n')
}

/**
 * 텍스트를 클립보드에 복사합니다.
 * navigator.clipboard 를 우선 사용하고, 미지원 환경에서는 execCommand 로 대체합니다.
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // 아래 폴백으로 진행합니다.
    }
  }

  // execCommand 폴백
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, text.length)
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(textarea)
  if (!ok) {
    throw new Error('클립보드 복사에 실패했습니다. 직접 복사해 주세요.')
  }
}

/**
 * 리포트 카드 DOM 노드를 고화질 PNG Blob 으로 변환합니다.
 * 선명한 공유 이미지를 위해 pixelRatio 를 높입니다.
 */
export async function exportCardToPng(node: HTMLElement): Promise<Blob> {
  const blob = await toBlob(node, {
    pixelRatio: 3,
    cacheBust: true,
    backgroundColor: '#ffffff',
  })
  if (!blob) {
    throw new Error('이미지를 생성하지 못했습니다. 다시 시도해 주세요.')
  }
  return blob
}

/** Web Share API(파일 공유)를 사용할 수 있는지 확인합니다. */
export function isWebShareSupported(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  return typeof navigator.share === 'function' && typeof navigator.canShare === 'function'
}

/**
 * 리포트 카드 이미지를 스마트폰 기본 공유창(Web Share API)으로 공유합니다.
 * 갤러리에 저장하지 않고 카카오톡 등으로 바로 전송할 수 있습니다.
 * 파일 공유를 지원하지 않으면 오류를 던져 호출부에서 폴백할 수 있게 합니다.
 */
export async function shareCardImage(blob: Blob, filename: string): Promise<void> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    throw new Error('이 브라우저는 공유 기능을 지원하지 않습니다.')
  }
  const file = new File([blob], filename, { type: 'image/png' })
  if (typeof navigator.canShare === 'function' && !navigator.canShare({ files: [file] })) {
    throw new Error('이 브라우저는 이미지 공유를 지원하지 않습니다.')
  }
  try {
    await navigator.share({
      files: [file],
      title: '학습 리포트',
      text: '학습 리포트를 보내드립니다.',
    })
  } catch (err) {
    // 사용자가 공유창을 닫은 경우는 오류가 아니므로 조용히 넘어갑니다.
    if (err instanceof DOMException && err.name === 'AbortError') {
      return
    }
    throw err
  }
}

/** PNG Blob 을 파일로 내려받습니다. */
export function downloadPng(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
