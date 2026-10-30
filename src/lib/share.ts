// 공유 유틸리티 (FEAT-004)
// 카카오톡 텍스트 복사, 리포트 카드 PNG 변환, Web Share API 공유, PNG 다운로드를 담당합니다.

import { toBlob } from 'html-to-image'
import { AppData, Report, ScoreSubject, Student } from '../types'
import { getLast8Scores } from './storage'
import { KOREAN_TAG_NOTES, KoreanTag } from '../data/feedbackTemplates'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** '10월 30일(금)' */
function shortKoreanDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${WEEKDAYS[d.getDay()]})`;
}

function previousScore(
  data: AppData | undefined,
  report: Report,
  subject: ScoreSubject,
): number | undefined {
  if (!data) {
    return undefined;
  }
  const hist = getLast8Scores(
    { ...data, reports: data.reports.filter((r) => r.id !== report.id) },
    report.studentId,
    subject,
  ).filter((s) => s.date < report.date);
  return hist.length > 0 ? hist[hist.length - 1].score : undefined;
}

/**
 * 리포트를 카카오톡 메시지용 텍스트로 바꿉니다.
 * 말머리마다 이모지 하나만 붙여 깔끔하게 정리하고, 마지막에 선생님 서명을 붙입니다.
 * data 를 넘기면 직전 점수 대비 변화와 선생님 이름까지 함께 적습니다.
 */
export function toKakaoText(report: Report, student: Student, data?: AppData): string {
  const lines: string[] = [];
  const showKorean = student.subjects === '국어' || student.subjects === '국수';
  const showMath = student.subjects === '수학' || student.subjects === '국수';
  const subjectLabel = student.subjects === '국수' ? '국어·수학' : student.subjects;
  const blank = () => lines.push('');

  lines.push(`[주간 학습 리포트] ${student.name} (${student.grade} ${subjectLabel})`);
  lines.push(`${shortKoreanDate(report.date)} 수업`);
  blank();

  if (report.testScores.length > 0) {
    lines.push('📌 테스트');
    for (const ts of report.testScores) {
      const prev = previousScore(data, report, ts.subject);
      let tail = '';
      if (typeof prev === 'number') {
        const diff = ts.score - prev;
        tail = diff === 0 ? ` (지난번과 같음)` : ` (지난번 ${prev}점, ${diff > 0 ? '+' : ''}${diff})`;
      }
      lines.push(`${ts.subject} ${ts.score}점${tail}`);
    }
    blank();
  }

  lines.push('📝 숙제·수업 태도');
  lines.push(
    `숙제 ${report.homeworkRate}% · 태도 ${'★'.repeat(report.attendanceFocus)}${'☆'.repeat(Math.max(0, 5 - report.attendanceFocus))}`,
  );
  blank();

  if (showKorean && (report.koreanAreas.length > 0 || report.koreanTags.length > 0)) {
    lines.push('📖 국어');
    if (report.koreanAreas.length > 0) {
      lines.push(`영역: ${report.koreanAreas.join(', ')}`);
    }
    for (const tag of report.koreanTags) {
      const weak = KOREAN_TAG_NOTES[tag as KoreanTag]?.kind === 'weakness';
      lines.push(`${weak ? '△' : '○'} ${tag}`);
    }
    blank();
  }

  if (showMath && (report.mathUnit.trim() || report.mathErrorCauses.length > 0)) {
    lines.push('✏️ 수학');
    if (report.mathUnit.trim()) {
      lines.push(`진도: ${report.mathUnit.trim()} (이해도 ${report.mathUnderstanding})`);
    }
    if (report.mathErrorCauses.length > 0) {
      const counts: Record<string, number> = { ...(report.mathErrorCounts ?? {}) };
      for (const c of report.mathErrorCauses) {
        if (!counts[c]) {
          counts[c] = 1;
        }
      }
      const rows = report.mathErrorCauses
        .map((c) => ({ c, n: counts[c] }))
        .sort((x, y) => y.n - x.n);
      const total = rows.reduce((sum, r) => sum + r.n, 0);
      lines.push(
        `오답 원인: ${rows.map((r) => `${r.c} ${Math.round((r.n / total) * 100)}%`).join(', ')}`,
      );
    }
    blank();
  }

  if (report.overallComment.trim()) {
    lines.push('💬 선생님 총평');
    lines.push(report.overallComment.trim());
    blank();
  }

  const tasks = report.nextAssignment
    .split(/\n|,(?![^()]*\))/)
    .map((t) => t.replace(/^[-·•\s]+/, '').trim())
    .filter(Boolean);
  if (tasks.length > 0) {
    lines.push('✅ 다음 시간까지');
    for (const t of tasks) {
      lines.push(`- ${t}`);
    }
    blank();
  }

  const teacher = data?.settings?.teacherName?.trim();
  if (teacher) {
    lines.push(`${teacher} 선생님 드림`);
  }

  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines.join('\n');
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
  const options = {
    pixelRatio: 3,
    cacheBust: true,
    backgroundColor: '#ffffff',
  }
  // iOS 사파리는 첫 변환에서 글꼴/SVG 가 빠지는 경우가 있어 한 번 미리 그려 둡니다.
  try {
    await toBlob(node, { ...options, pixelRatio: 1 })
  } catch {
    // 미리 그리기 실패는 무시하고 본 변환을 시도합니다.
  }
  const blob = await toBlob(node, options)
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
