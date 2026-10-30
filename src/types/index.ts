// 도메인 모델 정의 (FEAT-002)
// 모든 데이터는 로컬 스토리지에 저장되며, 백업/복구를 위해 JSON 으로 직렬화됩니다.

/** 수강 과목. '국수' 는 국어와 수학을 동시에 수강하는 경우입니다. */
export type Subject = '국어' | '수학' | '국수';

/** 테스트 점수가 속한 단일 과목 (국수 동시 수강이라도 점수는 과목별로 기록). */
export type ScoreSubject = '국어' | '수학';

/** 수학 이해도 단계. */
export type MathUnderstanding = '상' | '중' | '하';

/** 학생 프로필. */
export interface Student {
  id: string;
  /** 학생 이름. */
  name: string;
  /** 학년 (예: '중3', '고2', '고3'). 자유 문자열로 보관합니다. */
  grade: string;
  /** 수강 과목. */
  subjects: Subject;
  /** 목표 대학. */
  targetUniversity: string;
  /** 목표 성적 (예: '1등급', '백분위 90 이상'). */
  targetGrade: string;
  /** 수업 요일 목록 (예: ['월', '수', '금']). */
  lessonDays: string[];
  /** 생성 시각 (ISO 문자열). */
  createdAt: string;
}

/** 단일 회차 테스트 점수. 학생/과목별로 최근 8회차만 보관합니다. */
export interface TestScore {
  /** 응시일 (ISO 날짜 문자열, 예: '2024-05-01'). */
  date: string;
  /** 점수가 속한 과목. */
  subject: ScoreSubject;
  /** 0 ~ 100 점수. */
  score: number;
}

/** 리포트에 함께 기록되는 회차 점수 (과목 + 점수). */
export interface ReportTestScore {
  subject: ScoreSubject;
  score: number;
}

/** 주간 리포트 1건. 학생별로 누적 저장되어 히스토리로 열람합니다. */
export interface Report {
  id: string;
  /** 대상 학생 id. */
  studentId: string;
  /** 리포트 기준일 (ISO 날짜 문자열). */
  date: string;
  /** 수업 집중도 (별점 1 ~ 5). */
  attendanceFocus: number;
  /** 숙제 수행률 (0 ~ 100). */
  homeworkRate: number;
  /** 국어 영역 칩 (비문학 독해/현대문학/고전문학/문법(언매)/화작/어휘 등). */
  koreanAreas: string[];
  /** 국어 강점·약점 태그. */
  koreanTags: string[];
  /** 수학 단원명. */
  mathUnit: string;
  /** 수학 이해도. */
  mathUnderstanding: MathUnderstanding;
  /** 수학 오답 원인 목록. */
  mathErrorCauses: string[];
  /** 이번 회차 테스트 점수. */
  testScores: ReportTestScore[];
  /** 학부모님께 전달할 총평 문구. */
  overallComment: string;
  /** 다음 과제 안내. */
  nextAssignment: string;
  /** 생성 시각 (ISO 문자열). */
  createdAt: string;
}

/** 앱 전체 데이터 루트. 백업 파일의 최상위 구조이기도 합니다. */
export interface AppData {
  students: Student[];
  reports: Report[];
  /** 스키마 버전. 추후 마이그레이션에 사용합니다. */
  version: number;
}

/** 현재 데이터 스키마 버전. */
export const DATA_VERSION = 1;

/** 학생/과목별로 보관하는 최대 테스트 회차 수. */
export const MAX_SCORES_PER_SUBJECT = 8;

/** 빈 상태의 기본 데이터. */
export function createEmptyAppData(): AppData {
  return { students: [], reports: [], version: DATA_VERSION };
}
