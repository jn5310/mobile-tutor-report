// 데이터 백업(내보내기) / 복구(불러오기) 헬퍼 (FEAT-002)
// 기기 변경 시 전체 데이터를 JSON 파일로 옮길 수 있도록 지원합니다.

import { AppData, Report, Student } from '../types';
import { normalizeAppData } from './storage';

/** 날짜 기반 백업 파일명을 생성합니다 (예: tutor-report-backup-2024-05-01.json). */
export function buildBackupFileName(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `tutor-report-backup-${yyyy}-${mm}-${dd}.json`;
}

/**
 * 전체 AppData 를 JSON 파일로 내려받습니다.
 * Blob 과 임시 anchor 클릭을 이용합니다.
 */
export function exportToJsonFile(data: AppData, fileName = buildBackupFileName()): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // 다음 틱에 메모리를 해제합니다.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** 백업 JSON 구조가 올바른지 검증하고, 아니면 한국어 오류 메시지를 던집니다. */
export function validateAppData(value: unknown): AppData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('백업 파일 형식이 올바르지 않습니다. 최상위 데이터가 객체가 아닙니다.');
  }
  const obj = value as Record<string, unknown>;

  if (!Array.isArray(obj.students)) {
    throw new Error('백업 파일에 학생 목록(students)이 없거나 형식이 올바르지 않습니다.');
  }
  if (!Array.isArray(obj.reports)) {
    throw new Error('백업 파일에 리포트 목록(reports)이 없거나 형식이 올바르지 않습니다.');
  }

  for (const s of obj.students as unknown[]) {
    if (!s || typeof s !== 'object') {
      throw new Error('학생 데이터 중 올바르지 않은 항목이 있습니다.');
    }
    const student = s as Partial<Student>;
    if (typeof student.id !== 'string' || typeof student.name !== 'string') {
      throw new Error('학생 데이터에 필수 항목(id, 이름)이 누락되어 있습니다.');
    }
  }

  for (const r of obj.reports as unknown[]) {
    if (!r || typeof r !== 'object') {
      throw new Error('리포트 데이터 중 올바르지 않은 항목이 있습니다.');
    }
    const report = r as Partial<Report>;
    if (typeof report.id !== 'string' || typeof report.studentId !== 'string') {
      throw new Error('리포트 데이터에 필수 항목(id, 학생 id)이 누락되어 있습니다.');
    }
  }

  return normalizeAppData(obj);
}

/**
 * 업로드된 JSON 파일을 읽어 AppData 로 파싱/검증합니다.
 * 잘못된 파일이면 한국어 오류 메시지와 함께 reject 됩니다.
 */
export function importFromJsonFile(file: File): Promise<AppData> {
  return new Promise<AppData>((resolve, reject) => {
    if (!file) {
      reject(new Error('선택된 파일이 없습니다.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error('파일을 읽는 중 오류가 발생했습니다. 다시 시도해 주세요.'));
    };
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : '';
        if (!text.trim()) {
          throw new Error('파일이 비어 있습니다.');
        }
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error('JSON 형식이 올바르지 않아 파일을 해석할 수 없습니다.');
        }
        resolve(validateAppData(parsed));
      } catch (err) {
        reject(err instanceof Error ? err : new Error('백업 파일을 불러오지 못했습니다.'));
      }
    };
    reader.readAsText(file);
  });
}
