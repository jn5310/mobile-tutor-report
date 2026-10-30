// 샘플 데이터 생성기 (FEAT-002)
// 처음 앱을 켰을 때 기능을 바로 체험할 수 있도록 현실적인 한국어 예시 데이터를 만듭니다.

import { AppData, DATA_VERSION, Report, Student } from '../types';

/** n일 전 날짜의 ISO 날짜 문자열(yyyy-mm-dd)을 반환합니다. */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 2 ~ 3명의 현실적인 한국어 샘플 학생과 각 학생의 테스트 점수/리포트를 생성합니다.
 * 점수는 뚜렷한 추세(상승/하락)를 보여 히스토리 기능을 바로 확인할 수 있습니다.
 */
export function generateSampleData(): AppData {
  const nowIso = new Date().toISOString();

  const studentA: Student = {
    id: 'stu_sample_a',
    name: '김서연',
    grade: '고2',
    subjects: '국어',
    targetUniversity: '연세대학교',
    targetGrade: '국어 1등급',
    lessonDays: ['월', '목'],
    createdAt: nowIso,
  };

  const studentB: Student = {
    id: 'stu_sample_b',
    name: '박준호',
    grade: '고3',
    subjects: '수학',
    targetUniversity: '한양대학교',
    targetGrade: '수학 2등급',
    lessonDays: ['화', '금'],
    createdAt: nowIso,
  };

  const studentC: Student = {
    id: 'stu_sample_c',
    name: '이지안',
    grade: '중3',
    subjects: '국수',
    targetUniversity: '외국어고등학교 진학',
    targetGrade: '국어·수학 상위권',
    lessonDays: ['수', '토'],
    createdAt: nowIso,
  };

  // 국어 상승 추세 학생 리포트 2건
  const reportsA: Report[] = [
    {
      id: 'rep_sample_a1',
      studentId: studentA.id,
      date: daysAgo(14),
      attendanceFocus: 4,
      homeworkRate: 70,
      koreanAreas: ['비문학 독해', '문법(언매)'],
      koreanTags: ['선지 근거 찾기 연습 필요', '시간 배분 개선 중'],
      mathUnit: '',
      mathUnderstanding: '중',
      mathErrorCauses: [],
      testScores: [{ subject: '국어', score: 78 }],
      overallComment:
        '안녕하세요, 학부모님. 서연이는 비문학 독해에서 지문 구조를 파악하는 힘이 자라고 있습니다. 선지의 근거를 지문에서 찾는 연습을 이어가면 더 안정적인 결과가 기대됩니다. 다음 주에도 성실히 지도하겠습니다.',
      nextAssignment: '비문학 독해 지문 5세트, 문법 개념 노트 1단원 정리',
      createdAt: nowIso,
    },
    {
      id: 'rep_sample_a2',
      studentId: studentA.id,
      date: daysAgo(7),
      attendanceFocus: 5,
      homeworkRate: 90,
      koreanAreas: ['비문학 독해', '현대문학'],
      koreanTags: ['지문 구조화 우수', '핵심어 포착 능숙'],
      mathUnit: '',
      mathUnderstanding: '중',
      mathErrorCauses: [],
      testScores: [{ subject: '국어', score: 88 }],
      overallComment:
        '안녕하세요, 학부모님. 이번 주 서연이는 지문을 구조화하여 핵심을 빠르게 포착하는 모습이 돋보였습니다. 숙제 수행률도 크게 향상되어 성적 상승으로 이어졌습니다. 현재 흐름을 유지하도록 격려 부탁드립니다.',
      nextAssignment: '현대문학 작품 3편 분석, 비문학 실전 모의 1회',
      createdAt: nowIso,
    },
  ];

  // 수학 상승 추세 학생 리포트 1건
  const reportsB: Report[] = [
    {
      id: 'rep_sample_b1',
      studentId: studentB.id,
      date: daysAgo(6),
      attendanceFocus: 4,
      homeworkRate: 80,
      koreanAreas: [],
      koreanTags: [],
      mathUnit: '수열의 극한',
      mathUnderstanding: '중',
      mathErrorCauses: ['계산 실수', '풀이 과정 생략'],
      testScores: [{ subject: '수학', score: 72 }],
      overallComment:
        '안녕하세요, 학부모님. 준호는 수열의 극한 개념을 잘 이해하고 있으나, 계산 과정에서 사소한 실수가 반복되고 있습니다. 풀이 과정을 끝까지 적는 습관을 들이면 점수가 더욱 안정될 것입니다. 꾸준히 지도하겠습니다.',
      nextAssignment: '수열의 극한 유형별 20문항, 오답 다시 풀기',
      createdAt: nowIso,
    },
  ];

  // 국수 동시 수강 학생 리포트 1건
  const reportsC: Report[] = [
    {
      id: 'rep_sample_c1',
      studentId: studentC.id,
      date: daysAgo(5),
      attendanceFocus: 5,
      homeworkRate: 95,
      koreanAreas: ['어휘', '화작'],
      koreanTags: ['어휘력 탄탄', '발표 자신감 상승'],
      mathUnit: '이차함수',
      mathUnderstanding: '상',
      mathErrorCauses: ['문제 조건 해석 오류'],
      testScores: [
        { subject: '국어', score: 92 },
        { subject: '수학', score: 85 },
      ],
      overallComment:
        '안녕하세요, 학부모님. 지안이는 국어 어휘력이 탄탄하고 수학 이차함수 단원의 개념 이해도가 매우 높습니다. 문제의 조건을 꼼꼼히 확인하는 연습만 보완하면 두 과목 모두 상위권을 유지할 수 있습니다. 성실한 태도를 칭찬합니다.',
      nextAssignment: '어휘 어원 노트 2쪽, 이차함수 심화 10문항',
      createdAt: nowIso,
    },
  ];

  // 국어 과거 점수(최근 8회 이내 추세) 보강 리포트 - 히스토리 차트를 위해 추가
  const historyA: Report[] = [
    buildScoreOnlyReport('rep_sample_a_h1', studentA.id, daysAgo(42), '국어', 68),
    buildScoreOnlyReport('rep_sample_a_h2', studentA.id, daysAgo(35), '국어', 71),
    buildScoreOnlyReport('rep_sample_a_h3', studentA.id, daysAgo(28), '국어', 74),
    buildScoreOnlyReport('rep_sample_a_h4', studentA.id, daysAgo(21), '국어', 80),
  ];

  const historyB: Report[] = [
    buildScoreOnlyReport('rep_sample_b_h1', studentB.id, daysAgo(34), '수학', 58),
    buildScoreOnlyReport('rep_sample_b_h2', studentB.id, daysAgo(27), '수학', 63),
    buildScoreOnlyReport('rep_sample_b_h3', studentB.id, daysAgo(20), '수학', 66),
    buildScoreOnlyReport('rep_sample_b_h4', studentB.id, daysAgo(13), '수학', 70),
  ];

  return {
    students: [studentA, studentB, studentC],
    reports: [
      ...historyA,
      ...reportsA,
      ...historyB,
      ...reportsB,
      ...reportsC,
    ],
    version: DATA_VERSION,
  };
}

/** 점수 추세만 채우는 간단한 과거 리포트를 만듭니다. */
function buildScoreOnlyReport(
  id: string,
  studentId: string,
  date: string,
  subject: '국어' | '수학',
  score: number,
): Report {
  return {
    id,
    studentId,
    date,
    attendanceFocus: 4,
    homeworkRate: 75,
    koreanAreas: [],
    koreanTags: [],
    mathUnit: '',
    mathUnderstanding: '중',
    mathErrorCauses: [],
    testScores: [{ subject, score }],
    overallComment: '',
    nextAssignment: '',
    createdAt: new Date().toISOString(),
  };
}
