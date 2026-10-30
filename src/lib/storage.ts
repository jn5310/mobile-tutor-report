// 타입 안전 로컬 스토리지 서비스 (FEAT-002)
// 단일 키에 AppData 전체를 JSON 으로 보관합니다.
// 파싱 오류, 스토리지 미사용(SSR/시크릿 모드) 상황에서도 안전한 기본값을 반환합니다.

import {
  AppData,
  DATA_VERSION,
  MAX_SCORES_PER_SUBJECT,
  Report,
  ScoreSubject,
  Student,
  TestScore,
  createEmptyAppData,
} from '../types';

/** 로컬 스토리지 단일 키. */
export const STORAGE_KEY = 'mtr:data:v1';

/** 로컬 스토리지 사용 가능 여부를 안전하게 확인합니다. */
function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    // 시크릿 모드 등에서 접근 시 예외가 발생할 수 있으므로 쓰기 테스트를 수행합니다.
    const testKey = '__mtr_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 외부에서 읽어온 임의의 값이 AppData 형태인지 검증하고, 아니면 안전한 기본값으로 보정합니다. */
export function normalizeAppData(value: unknown): AppData {
  if (!value || typeof value !== 'object') {
    return createEmptyAppData();
  }
  const data = value as Partial<AppData>;
  const students = Array.isArray(data.students) ? (data.students as Student[]) : [];
  const reports = Array.isArray(data.reports) ? (data.reports as Report[]) : [];
  const version = typeof data.version === 'number' ? data.version : DATA_VERSION;
  return { students, reports, version };
}

/** 저장된 데이터를 불러옵니다. 없거나 손상된 경우 빈 데이터를 반환합니다. */
export function loadData(): AppData {
  const storage = getStorage();
  if (!storage) {
    return createEmptyAppData();
  }
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return createEmptyAppData();
  }
  try {
    return normalizeAppData(JSON.parse(raw));
  } catch {
    return createEmptyAppData();
  }
}

/** 데이터를 저장합니다. 스토리지를 사용할 수 없으면 조용히 무시합니다. */
export function saveData(data: AppData): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 용량 초과 등은 무시합니다.
  }
}

/** 모든 데이터를 삭제합니다. */
export function clearData(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // 무시합니다.
  }
}

/** 저장된 데이터를 통째로 교체합니다 (백업 복구/샘플 생성 시 사용). */
export function replaceData(data: AppData): AppData {
  const normalized = normalizeAppData(data);
  saveData(normalized);
  return normalized;
}

// ---------------------------------------------------------------------------
// 학생 CRUD
// ---------------------------------------------------------------------------

/** 간단한 고유 id 생성기. */
export function createId(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

/** 학생을 추가하고 변경된 데이터를 반환합니다. */
export function addStudent(
  data: AppData,
  student: Omit<Student, 'id' | 'createdAt'> & Partial<Pick<Student, 'id' | 'createdAt'>>,
): AppData {
  const newStudent: Student = {
    id: student.id ?? createId('stu'),
    createdAt: student.createdAt ?? new Date().toISOString(),
    name: student.name,
    grade: student.grade,
    subjects: student.subjects,
    targetUniversity: student.targetUniversity,
    targetGrade: student.targetGrade,
    lessonDays: student.lessonDays,
  };
  const next: AppData = { ...data, students: [...data.students, newStudent] };
  saveData(next);
  return next;
}

/** 학생 정보를 수정합니다. */
export function updateStudent(
  data: AppData,
  studentId: string,
  patch: Partial<Omit<Student, 'id'>>,
): AppData {
  const students = data.students.map((s) =>
    s.id === studentId ? { ...s, ...patch, id: s.id } : s,
  );
  const next: AppData = { ...data, students };
  saveData(next);
  return next;
}

/** 학생과 그 학생의 모든 리포트를 함께 삭제합니다. */
export function deleteStudent(data: AppData, studentId: string): AppData {
  const next: AppData = {
    ...data,
    students: data.students.filter((s) => s.id !== studentId),
    reports: data.reports.filter((r) => r.studentId !== studentId),
  };
  saveData(next);
  return next;
}

/** 특정 학생을 조회합니다. */
export function getStudent(data: AppData, studentId: string): Student | undefined {
  return data.students.find((s) => s.id === studentId);
}

// ---------------------------------------------------------------------------
// 리포트 CRUD / 히스토리
// ---------------------------------------------------------------------------

/** 리포트를 추가합니다. */
export function addReport(
  data: AppData,
  report: Omit<Report, 'id' | 'createdAt'> & Partial<Pick<Report, 'id' | 'createdAt'>>,
): AppData {
  const newReport: Report = {
    ...report,
    id: report.id ?? createId('rep'),
    createdAt: report.createdAt ?? new Date().toISOString(),
  } as Report;
  const next: AppData = { ...data, reports: [...data.reports, newReport] };
  saveData(next);
  return next;
}

/** 리포트를 삭제합니다. */
export function deleteReport(data: AppData, reportId: string): AppData {
  const next: AppData = {
    ...data,
    reports: data.reports.filter((r) => r.id !== reportId),
  };
  saveData(next);
  return next;
}

/** 특정 학생의 리포트를 최신순으로 반환합니다 (히스토리 열람용). */
export function getReportsByStudent(data: AppData, studentId: string): Report[] {
  return data.reports
    .filter((r) => r.studentId === studentId)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/**
 * 학생/과목별 최근 8회차 테스트 점수를 날짜 오름차순으로 반환합니다.
 * 각 리포트의 date 와 testScores 를 조합하여 생성합니다.
 */
export function getLast8Scores(
  data: AppData,
  studentId: string,
  subject: ScoreSubject,
): TestScore[] {
  const scores: TestScore[] = [];
  for (const report of data.reports) {
    if (report.studentId !== studentId) {
      continue;
    }
    for (const ts of report.testScores) {
      if (ts.subject === subject) {
        scores.push({ date: report.date, subject, score: ts.score });
      }
    }
  }
  scores.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return scores.slice(-MAX_SCORES_PER_SUBJECT);
}
