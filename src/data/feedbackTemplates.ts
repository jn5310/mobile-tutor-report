// 고품격 피드백 문구 라이브러리 (FEAT-002)
// 학부모님께 매주 정중하고 전문적인 피드백을 드리기 위한 상황별 템플릿 모음입니다.
// 카테고리별 최소 수량: homework >= 15, direction >= 20, korean >= 25, math >= 25.
// 총합 80종 이상을 내장합니다. (하단 count 단언 주석 참고)

import { MathUnderstanding } from '../types';

/** 피드백 템플릿 카테고리. */
export type FeedbackCategory = 'homework' | 'direction' | 'korean' | 'math';

/** 템플릿의 어조. */
export type FeedbackTone = 'praise' | 'improve' | 'neutral';

/** 단일 피드백 템플릿. */
export interface FeedbackTemplate {
  id: string;
  category: FeedbackCategory;
  text: string;
  tone?: FeedbackTone;
  /** 연관 태그/영역/오답 원인 키워드. */
  tags?: string[];
}

// ---------------------------------------------------------------------------
// 재사용 상수: 국어 강점·약점 태그 (15종 이상)
// ---------------------------------------------------------------------------
export const KOREAN_TAGS = [
  '지문 구조화 우수',
  '핵심어 포착 능숙',
  '선지 근거 찾기 연습 필요',
  '시간 배분 개선 중',
  '고전 어휘력 보완 필요',
  '현대문학 정서 파악 우수',
  '문법 개념 암기 탄탄',
  '화작 담화 분석 안정적',
  '추론적 사고 강화 필요',
  '배경지식 활용 능숙',
  '오답 근거 설명 연습 필요',
  '발표 자신감 상승',
  '어휘력 탄탄',
  '지문 요약 능력 향상 중',
  '선지 비교 판단 신중함 필요',
  '문맥 추론 정확도 우수',
  '글의 흐름 파악 능숙',
] as const;

export type KoreanTag = (typeof KOREAN_TAGS)[number];

// ---------------------------------------------------------------------------
// 재사용 상수: 국어 영역 칩
// ---------------------------------------------------------------------------
export const KOREAN_AREAS = [
  '비문학 독해',
  '현대문학',
  '고전문학',
  '문법(언매)',
  '화작',
  '어휘',
] as const;

export type KoreanArea = (typeof KOREAN_AREAS)[number];

// ---------------------------------------------------------------------------
// 재사용 상수: 수학 오답 원인
// ---------------------------------------------------------------------------
export const MATH_ERROR_CAUSES = [
  '계산 실수',
  '개념 암기 부족',
  '문제 조건 해석 오류',
  '고난도 응용력 부족',
  '풀이 과정 생략',
] as const;

export type MathErrorCause = (typeof MATH_ERROR_CAUSES)[number];

// ---------------------------------------------------------------------------
// 숙제 미흡 완곡 안내 (15종 이상)
// ---------------------------------------------------------------------------
export const homeworkTemplates: FeedbackTemplate[] = [
  {
    id: 'hw_01',
    category: 'homework',
    tone: 'improve',
    text: '이번 주에는 과제의 일부가 마무리되지 못한 점이 조금 아쉬웠습니다. 가정에서 가볍게 확인해 주시면 학습 리듬을 잡는 데 큰 도움이 됩니다.',
  },
  {
    id: 'hw_02',
    category: 'homework',
    tone: 'improve',
    text: '과제 수행이 평소보다 다소 더뎠으나, 수업 중 집중하려는 모습은 분명했습니다. 분량을 조금 나누어 매일 꾸준히 진행하도록 함께 격려해 주시면 좋겠습니다.',
  },
  {
    id: 'hw_03',
    category: 'homework',
    tone: 'improve',
    text: '숙제 일부가 누락되어 복습 흐름이 끊긴 부분이 있었습니다. 다음 주에는 제출 전 한 번 점검하는 습관을 함께 만들어 보겠습니다.',
  },
  {
    id: 'hw_04',
    category: 'homework',
    tone: 'improve',
    text: '바쁜 일정 속에서도 과제를 챙기려 애쓴 흔적이 보였습니다. 다만 마무리까지 이어지지 못한 부분이 있어, 완료 여부를 가볍게 챙겨 주시면 감사하겠습니다.',
  },
  {
    id: 'hw_05',
    category: 'homework',
    tone: 'improve',
    text: '제출된 과제의 정성은 좋았으나 분량을 다 채우지 못했습니다. 무리하지 않는 선에서 조금씩 채워 가도록 지도하겠습니다.',
  },
  {
    id: 'hw_06',
    category: 'homework',
    tone: 'improve',
    text: '숙제가 밀린 점이 있어 다음 수업에서 함께 보완할 예정입니다. 학습 부담이 과하지 않도록 분량을 조정해 드리겠습니다.',
  },
  {
    id: 'hw_07',
    category: 'homework',
    tone: 'improve',
    text: '과제를 시작은 하였으나 끝맺음이 부족했습니다. 시작한 것을 끝까지 마무리하는 성취감을 느낄 수 있도록 지도하겠습니다.',
  },
  {
    id: 'hw_08',
    category: 'homework',
    tone: 'improve',
    text: '이번 주 과제 수행률이 낮아 아쉬웠지만, 질문하는 태도는 적극적이었습니다. 복습 과제를 우선순위로 두어 꾸준히 이어가 보겠습니다.',
  },
  {
    id: 'hw_09',
    category: 'homework',
    tone: 'improve',
    text: '과제 제출이 미뤄지는 경우가 있어, 제출 요일을 정해 두면 한결 수월할 것으로 보입니다. 가정에서도 함께 지켜봐 주시면 감사하겠습니다.',
  },
  {
    id: 'hw_10',
    category: 'homework',
    tone: 'improve',
    text: '숙제 일부가 미완성이었지만 내용의 이해도는 양호했습니다. 양보다 꾸준함에 초점을 두어 습관을 잡아가도록 하겠습니다.',
  },
  {
    id: 'hw_11',
    category: 'homework',
    tone: 'improve',
    text: '과제를 소홀히 한 것은 아니나 분량 조절에 어려움이 있었던 듯합니다. 하루 목표 분량을 함께 정해 부담을 줄여 보겠습니다.',
  },
  {
    id: 'hw_12',
    category: 'homework',
    tone: 'improve',
    text: '이번 주는 과제가 충분히 이루어지지 못했습니다. 작은 성공 경험을 쌓도록 쉬운 문제부터 차근차근 과제를 구성하겠습니다.',
  },
  {
    id: 'hw_13',
    category: 'homework',
    tone: 'improve',
    text: '숙제가 부분적으로만 완료되었습니다. 미완료 부분은 다음 수업에서 함께 점검하여 빈틈이 생기지 않도록 하겠습니다.',
  },
  {
    id: 'hw_14',
    category: 'homework',
    tone: 'improve',
    text: '과제 수행이 들쭉날쭉한 편이라 꾸준함을 위한 작은 루틴이 필요해 보입니다. 가정에서 학습 시간을 정해 주시면 큰 도움이 됩니다.',
  },
  {
    id: 'hw_15',
    category: 'homework',
    tone: 'improve',
    text: '과제가 미흡했던 주간이지만 아이의 의욕은 충분합니다. 다그치기보다 격려로 접근하여 학습 자신감을 지켜 주겠습니다.',
  },
  {
    id: 'hw_16',
    category: 'homework',
    tone: 'improve',
    text: '숙제를 꾸준히 이어가면 수업 효과가 배가됩니다. 이번 주 부족했던 분량은 다음 주에 자연스럽게 녹여 보완하겠습니다.',
  },
];

// ---------------------------------------------------------------------------
// 성적 상승/하락 방향 제시 (20종 이상, 상승/하락 혼합)
// ---------------------------------------------------------------------------
export const directionTemplates: FeedbackTemplate[] = [
  // 상승
  {
    id: 'dir_up_01',
    category: 'direction',
    tone: 'praise',
    tags: ['rise'],
    text: '지난 회차 대비 점수가 뚜렷하게 상승했습니다. 현재의 학습 방법이 잘 맞고 있으니 흐름을 그대로 유지하도록 지도하겠습니다.',
  },
  {
    id: 'dir_up_02',
    category: 'direction',
    tone: 'praise',
    tags: ['rise'],
    text: '성적이 꾸준히 오르고 있어 매우 고무적입니다. 이제는 실수 없이 안정적으로 득점하는 단계로 끌어올리겠습니다.',
  },
  {
    id: 'dir_up_03',
    category: 'direction',
    tone: 'praise',
    tags: ['rise'],
    text: '노력의 결과가 점수로 나타나기 시작했습니다. 상승세를 굳히기 위해 약점 단원을 집중 보완하는 방향으로 계획을 잡겠습니다.',
  },
  {
    id: 'dir_up_04',
    category: 'direction',
    tone: 'praise',
    tags: ['rise'],
    text: '이전보다 한층 향상된 결과를 보여 주었습니다. 목표 성적까지 남은 간격을 단계별 목표로 나누어 관리하겠습니다.',
  },
  {
    id: 'dir_up_05',
    category: 'direction',
    tone: 'praise',
    tags: ['rise'],
    text: '점수가 상승하며 자신감도 함께 붙고 있습니다. 이 자신감이 학습 지속의 동력이 되도록 성공 경험을 계속 쌓아 가겠습니다.',
  },
  {
    id: 'dir_up_06',
    category: 'direction',
    tone: 'praise',
    tags: ['rise'],
    text: '상승 폭이 안정적이어서 기초가 탄탄해지고 있음을 확인했습니다. 다음 단계로 심화 문제 적응력을 키워 가겠습니다.',
  },
  {
    id: 'dir_up_07',
    category: 'direction',
    tone: 'praise',
    tags: ['rise'],
    text: '꾸준한 상승 곡선을 그리고 있어 목표 대학 진학에 긍정적인 신호입니다. 지금의 성실함을 유지할 수 있도록 응원 부탁드립니다.',
  },
  {
    id: 'dir_up_08',
    category: 'direction',
    tone: 'praise',
    tags: ['rise'],
    text: '이번 결과는 지난 몇 주간의 노력이 반영된 값진 성과입니다. 상위권 안착을 위해 고난도 문항 대응력을 보강하겠습니다.',
  },
  {
    id: 'dir_up_09',
    category: 'direction',
    tone: 'praise',
    tags: ['rise'],
    text: '점수가 오르면서 학습 태도 또한 한층 성숙해졌습니다. 이 긍정적 변화가 장기적인 성장으로 이어지도록 세심히 관리하겠습니다.',
  },
  {
    id: 'dir_up_10',
    category: 'direction',
    tone: 'praise',
    tags: ['rise'],
    text: '상승세가 확인되어 매우 기쁩니다. 다만 방심은 금물이므로 기본기 점검을 병행하며 흐름을 안정적으로 이어가겠습니다.',
  },
  // 하락
  {
    id: 'dir_down_01',
    category: 'direction',
    tone: 'improve',
    tags: ['drop'],
    text: '이번 회차는 점수가 다소 하락했습니다. 일시적 요인인지 학습 공백 때문인지 원인을 함께 점검하여 빠르게 회복시키겠습니다.',
  },
  {
    id: 'dir_down_02',
    category: 'direction',
    tone: 'improve',
    tags: ['drop'],
    text: '점수가 지난 회차보다 내려갔지만 과도하게 걱정하실 필요는 없습니다. 틀린 유형을 분석하여 보완 계획을 명확히 세우겠습니다.',
  },
  {
    id: 'dir_down_03',
    category: 'direction',
    tone: 'improve',
    tags: ['drop'],
    text: '결과가 기대에 미치지 못했으나, 이는 약점을 구체적으로 확인할 수 있는 기회이기도 합니다. 취약 단원부터 다시 다지겠습니다.',
  },
  {
    id: 'dir_down_04',
    category: 'direction',
    tone: 'improve',
    tags: ['drop'],
    text: '점수 하락은 아쉽지만 학습 의지는 여전히 뚜렷합니다. 기본 개념을 재점검하여 흔들린 부분을 단단히 메우겠습니다.',
  },
  {
    id: 'dir_down_05',
    category: 'direction',
    tone: 'improve',
    tags: ['drop'],
    text: '이번 결과가 하락세로 굳어지지 않도록 다음 주 학습량과 복습 주기를 세밀하게 조정하겠습니다.',
  },
  {
    id: 'dir_down_06',
    category: 'direction',
    tone: 'improve',
    tags: ['drop'],
    text: '점수가 내려간 만큼 틀린 문제의 원인을 함께 짚어 보았습니다. 같은 실수가 반복되지 않도록 오답 관리에 집중하겠습니다.',
  },
  {
    id: 'dir_down_07',
    category: 'direction',
    tone: 'improve',
    tags: ['drop'],
    text: '성적이 주춤했지만 이는 성장 과정에서 충분히 있을 수 있는 일입니다. 조급해하지 않고 기초부터 차분히 재정비하겠습니다.',
  },
  {
    id: 'dir_down_08',
    category: 'direction',
    tone: 'improve',
    tags: ['drop'],
    text: '이번 하락의 주요 원인은 특정 유형의 반복 실수로 보입니다. 해당 유형을 집중 훈련하여 다음 회차에 반등을 만들겠습니다.',
  },
  {
    id: 'dir_down_09',
    category: 'direction',
    tone: 'improve',
    tags: ['drop'],
    text: '결과가 하락하여 본인도 아쉬워하는 모습이었습니다. 자신감을 잃지 않도록 작은 성취부터 다시 쌓아 회복시키겠습니다.',
  },
  {
    id: 'dir_down_10',
    category: 'direction',
    tone: 'improve',
    tags: ['drop'],
    text: '점수가 내려갔으나 풀이 과정에서 가능성은 충분히 확인했습니다. 마무리 정확도를 높이는 방향으로 지도 전략을 수정하겠습니다.',
  },
  // 유지/중립
  {
    id: 'dir_hold_01',
    category: 'direction',
    tone: 'neutral',
    tags: ['hold'],
    text: '점수는 큰 변동 없이 유지되고 있습니다. 안정적인 흐름을 바탕으로 다음 단계 도약을 위한 심화 학습을 준비하겠습니다.',
  },
  {
    id: 'dir_hold_02',
    category: 'direction',
    tone: 'neutral',
    tags: ['hold'],
    text: '현재 성적을 꾸준히 유지하고 있어 기본기가 안정적임을 알 수 있습니다. 한 단계 상승을 위한 전략을 새롭게 세우겠습니다.',
  },
];

// ---------------------------------------------------------------------------
// 국어 영역별 학습 처방 (25종 이상)
// 비문학 독해/현대문학/고전문학/문법(언매)/화작/어휘 전 영역 포함
// ---------------------------------------------------------------------------
export const koreanTemplates: FeedbackTemplate[] = [
  // 비문학 독해
  {
    id: 'kor_read_01',
    category: 'korean',
    tags: ['비문학 독해'],
    text: '비문학 독해에서는 문단별 중심 문장을 표시하며 지문의 구조를 먼저 파악하는 훈련을 권합니다.',
  },
  {
    id: 'kor_read_02',
    category: 'korean',
    tags: ['비문학 독해'],
    text: '정보량이 많은 과학·기술 지문은 핵심 개념과 예시를 분리해 읽는 연습으로 독해 속도를 높이겠습니다.',
  },
  {
    id: 'kor_read_03',
    category: 'korean',
    tags: ['비문학 독해'],
    text: '선지의 근거를 지문에서 직접 찾아 밑줄로 확인하는 습관을 들여 오답률을 낮추겠습니다.',
  },
  {
    id: 'kor_read_04',
    category: 'korean',
    tags: ['비문학 독해'],
    text: '지문 간 관계를 묻는 신유형에 대비해 비교·대조 구조를 도식화하는 훈련을 진행하겠습니다.',
  },
  {
    id: 'kor_read_05',
    category: 'korean',
    tags: ['비문학 독해'],
    text: '시간 압박 속에서도 정확도를 유지하도록 제한 시간을 둔 실전 지문 풀이를 반복하겠습니다.',
  },
  // 현대문학
  {
    id: 'kor_mod_01',
    category: 'korean',
    tags: ['현대문학'],
    text: '현대시는 화자의 정서와 시적 상황을 먼저 정리한 뒤 표현 기법을 분석하는 순서로 접근하겠습니다.',
  },
  {
    id: 'kor_mod_02',
    category: 'korean',
    tags: ['현대문학'],
    text: '현대소설은 인물의 심리 변화와 서술 시점을 함께 파악하여 작품 해석의 깊이를 더하겠습니다.',
  },
  {
    id: 'kor_mod_03',
    category: 'korean',
    tags: ['현대문학'],
    text: '낯선 작품에도 당황하지 않도록 상황과 정서를 추론하는 보기 활용 전략을 집중 연습하겠습니다.',
  },
  {
    id: 'kor_mod_04',
    category: 'korean',
    tags: ['현대문학'],
    text: '표현상의 특징을 묻는 문항에 대비해 비유·상징·반어 등 주요 기법을 작품 속에서 식별하는 훈련을 하겠습니다.',
  },
  // 고전문학
  {
    id: 'kor_class_01',
    category: 'korean',
    tags: ['고전문학'],
    text: '고전 시가는 자주 등장하는 소재의 상징 의미를 정리해 두면 해석이 한결 수월해집니다. 어휘 정리부터 함께 하겠습니다.',
  },
  {
    id: 'kor_class_02',
    category: 'korean',
    tags: ['고전문학'],
    text: '고전 산문은 인물 관계와 사건 전개를 현대어로 바꾸어 읽는 연습으로 낯섦을 줄이겠습니다.',
  },
  {
    id: 'kor_class_03',
    category: 'korean',
    tags: ['고전문학'],
    text: '고전 어휘력이 부족하면 해석이 흔들리므로, 빈출 고어 어휘 노트를 만들어 반복 암기하도록 지도하겠습니다.',
  },
  {
    id: 'kor_class_04',
    category: 'korean',
    tags: ['고전문학'],
    text: '갈래별 특징(가사·시조·판소리계 소설 등)을 정리하여 작품 유형을 빠르게 파악하도록 훈련하겠습니다.',
  },
  // 문법(언매)
  {
    id: 'kor_gram_01',
    category: 'korean',
    tags: ['문법(언매)'],
    text: '문법(언매)은 개념을 암기에 그치지 않고 예문에 적용해 보는 방식으로 이해를 단단히 하겠습니다.',
  },
  {
    id: 'kor_gram_02',
    category: 'korean',
    tags: ['문법(언매)'],
    text: '음운 변동과 단어 형성 단원은 규칙을 표로 정리해 헷갈리는 사례를 반복 점검하겠습니다.',
  },
  {
    id: 'kor_gram_03',
    category: 'korean',
    tags: ['문법(언매)'],
    text: '문장 성분과 높임 표현은 실제 문장을 분석하며 적용력을 키우는 연습을 진행하겠습니다.',
  },
  {
    id: 'kor_gram_04',
    category: 'korean',
    tags: ['문법(언매)'],
    text: '매체 영역은 매체 자료의 특성과 표현 전략을 함께 분석하여 신유형에 대비하겠습니다.',
  },
  {
    id: 'kor_gram_05',
    category: 'korean',
    tags: ['문법(언매)'],
    text: '문법 오답은 개념 혼동에서 비롯되는 경우가 많아, 오답 노트로 혼동 지점을 명확히 구분하겠습니다.',
  },
  // 화작
  {
    id: 'kor_speak_01',
    category: 'korean',
    tags: ['화작'],
    text: '화법과 작문은 담화의 목적과 맥락을 먼저 파악하는 훈련으로 선지 판단의 정확도를 높이겠습니다.',
  },
  {
    id: 'kor_speak_02',
    category: 'korean',
    tags: ['화작'],
    text: '작문 영역은 고쳐쓰기와 자료 활용 문항에서 근거를 분명히 하는 연습을 집중적으로 하겠습니다.',
  },
  {
    id: 'kor_speak_03',
    category: 'korean',
    tags: ['화작'],
    text: '토론·발표 지문은 말하기 전략과 청자 고려 요소를 구분하여 읽도록 지도하겠습니다.',
  },
  {
    id: 'kor_speak_04',
    category: 'korean',
    tags: ['화작'],
    text: '화작은 비교적 안정적으로 득점할 수 있는 영역이므로, 실수 없이 만점을 지키는 데 목표를 두겠습니다.',
  },
  // 어휘
  {
    id: 'kor_vocab_01',
    category: 'korean',
    tags: ['어휘'],
    text: '어휘력은 모든 영역의 기초가 되므로, 문맥 속에서 단어의 의미를 추론하는 훈련을 꾸준히 병행하겠습니다.',
  },
  {
    id: 'kor_vocab_02',
    category: 'korean',
    tags: ['어휘'],
    text: '한자어와 다의어의 쓰임을 예문과 함께 정리하여 어휘 문항의 정답률을 높이겠습니다.',
  },
  {
    id: 'kor_vocab_03',
    category: 'korean',
    tags: ['어휘'],
    text: '빈출 어휘를 주제별로 묶어 암기하면 독해 속도까지 함께 향상됩니다. 어휘 노트를 체계적으로 관리하겠습니다.',
  },
  {
    id: 'kor_vocab_04',
    category: 'korean',
    tags: ['어휘'],
    text: '어휘의 사전적 의미와 문맥적 의미를 구분하는 연습으로 어휘 추론 문항에 대비하겠습니다.',
  },
  // 통합/태도
  {
    id: 'kor_gen_01',
    category: 'korean',
    tags: ['지문 구조화 우수'],
    text: '지문의 전체 구조를 빠르게 잡아내는 강점을 살려, 세부 정보 확인의 정확도까지 끌어올리겠습니다.',
  },
  {
    id: 'kor_gen_02',
    category: 'korean',
    tags: ['시간 배분 개선 중'],
    text: '영역별 시간 배분을 개선하고 있어, 실전 모의고사로 체감 시간을 조율하도록 돕겠습니다.',
  },
];

// ---------------------------------------------------------------------------
// 수학 오답 유형별 학습 처방 (25종 이상)
// 계산 실수/개념 암기 부족/문제 조건 해석 오류/고난도 응용력 부족/풀이 과정 생략 전부 포함
// ---------------------------------------------------------------------------
export const mathTemplates: FeedbackTemplate[] = [
  // 계산 실수
  {
    id: 'math_calc_01',
    category: 'math',
    tags: ['계산 실수'],
    text: '개념 이해는 충분하나 계산 실수로 점수를 놓치는 경우가 보입니다. 검산 습관을 들여 실수를 줄이겠습니다.',
  },
  {
    id: 'math_calc_02',
    category: 'math',
    tags: ['계산 실수'],
    text: '부호와 분수 처리에서 사소한 실수가 반복됩니다. 중간 계산을 또박또박 적는 연습으로 정확도를 높이겠습니다.',
  },
  {
    id: 'math_calc_03',
    category: 'math',
    tags: ['계산 실수'],
    text: '시간에 쫓길 때 계산 실수가 늘어나는 경향이 있어, 계산 속도와 정확도를 함께 기르는 훈련을 하겠습니다.',
  },
  {
    id: 'math_calc_04',
    category: 'math',
    tags: ['계산 실수'],
    text: '계산 과정을 암산에 의존하는 부분이 있어, 핵심 단계를 반드시 기록하도록 지도하여 실수를 예방하겠습니다.',
  },
  {
    id: 'math_calc_05',
    category: 'math',
    tags: ['계산 실수'],
    text: '마지막 답 정리 단계에서의 실수가 아쉽습니다. 답을 적기 전 한 번 더 확인하는 루틴을 만들겠습니다.',
  },
  // 개념 암기 부족
  {
    id: 'math_concept_01',
    category: 'math',
    tags: ['개념 암기 부족'],
    text: '공식과 정의의 암기가 아직 부족하여 문제 접근이 더딘 편입니다. 핵심 개념을 요약 카드로 반복 점검하겠습니다.',
  },
  {
    id: 'math_concept_02',
    category: 'math',
    tags: ['개념 암기 부족'],
    text: '개념이 정확히 정착되지 않아 유사 문제에서 흔들립니다. 개념을 문장으로 설명해 보는 훈련으로 이해를 굳히겠습니다.',
  },
  {
    id: 'math_concept_03',
    category: 'math',
    tags: ['개념 암기 부족'],
    text: '단원 간 개념 연결이 약해 통합형 문제에서 어려움을 겪습니다. 개념 지도를 그려 전체 흐름을 잡아 주겠습니다.',
  },
  {
    id: 'math_concept_04',
    category: 'math',
    tags: ['개념 암기 부족'],
    text: '정의와 성질을 혼동하는 지점이 있어, 기본 예제를 통해 개념의 쓰임을 명확히 구분하도록 지도하겠습니다.',
  },
  {
    id: 'math_concept_05',
    category: 'math',
    tags: ['개념 암기 부족'],
    text: '기초 개념이 탄탄해지면 응용 문제도 자연스럽게 풀립니다. 당분간 개념 복습에 비중을 두겠습니다.',
  },
  // 문제 조건 해석 오류
  {
    id: 'math_cond_01',
    category: 'math',
    tags: ['문제 조건 해석 오류'],
    text: '문제의 조건을 꼼꼼히 읽지 않아 틀리는 경우가 있습니다. 조건에 밑줄을 그으며 정리하는 습관을 들이겠습니다.',
  },
  {
    id: 'math_cond_02',
    category: 'math',
    tags: ['문제 조건 해석 오류'],
    text: '복잡한 조건을 수식으로 옮기는 과정에서 오류가 발생합니다. 조건을 식으로 번역하는 연습을 집중적으로 하겠습니다.',
  },
  {
    id: 'math_cond_03',
    category: 'math',
    tags: ['문제 조건 해석 오류'],
    text: '숨은 조건이나 범위 제한을 놓치는 경우가 보입니다. 문제를 끝까지 읽고 조건을 재확인하도록 지도하겠습니다.',
  },
  {
    id: 'math_cond_04',
    category: 'math',
    tags: ['문제 조건 해석 오류'],
    text: '그래프와 도형 문항에서 주어진 정보를 그림에 표시하는 연습으로 조건 해석력을 높이겠습니다.',
  },
  {
    id: 'math_cond_05',
    category: 'math',
    tags: ['문제 조건 해석 오류'],
    text: '문제가 무엇을 묻는지 먼저 정리한 뒤 풀이를 시작하는 접근법으로 조건 오독을 줄이겠습니다.',
  },
  // 고난도 응용력 부족
  {
    id: 'math_adv_01',
    category: 'math',
    tags: ['고난도 응용력 부족'],
    text: '기본 문제는 안정적이나 고난도 응용에서 막히는 편입니다. 발상 전환이 필요한 유형을 단계적으로 훈련하겠습니다.',
  },
  {
    id: 'math_adv_02',
    category: 'math',
    tags: ['고난도 응용력 부족'],
    text: '준킬러·킬러 문항 대비를 위해 여러 개념을 엮는 통합형 문제의 풀이 전략을 체계적으로 익히겠습니다.',
  },
  {
    id: 'math_adv_03',
    category: 'math',
    tags: ['고난도 응용력 부족'],
    text: '어려운 문제 앞에서 쉽게 포기하지 않도록, 풀이의 실마리를 찾는 사고 과정을 함께 연습하겠습니다.',
  },
  {
    id: 'math_adv_04',
    category: 'math',
    tags: ['고난도 응용력 부족'],
    text: '응용력은 양질의 문제를 충분히 경험할 때 길러집니다. 난도를 단계적으로 높여 도전 과제를 제공하겠습니다.',
  },
  {
    id: 'math_adv_05',
    category: 'math',
    tags: ['고난도 응용력 부족'],
    text: '한 문제를 여러 방법으로 풀어 보는 훈련으로 유연한 사고력과 응용력을 함께 키우겠습니다.',
  },
  // 풀이 과정 생략
  {
    id: 'math_proc_01',
    category: 'math',
    tags: ['풀이 과정 생략'],
    text: '풀이 과정을 생략하다 보니 어디서 틀렸는지 확인하기 어렵습니다. 과정을 끝까지 적는 습관을 들이겠습니다.',
  },
  {
    id: 'math_proc_02',
    category: 'math',
    tags: ['풀이 과정 생략'],
    text: '중간 단계를 건너뛰다 오류가 생기는 경우가 있어, 단계별로 또박또박 풀이를 서술하도록 지도하겠습니다.',
  },
  {
    id: 'math_proc_03',
    category: 'math',
    tags: ['풀이 과정 생략'],
    text: '서술형과 논술형 대비를 위해 논리적 흐름이 보이도록 풀이를 구조화하는 연습을 하겠습니다.',
  },
  {
    id: 'math_proc_04',
    category: 'math',
    tags: ['풀이 과정 생략'],
    text: '풀이를 생략하면 검산이 어려워 실수 교정이 늦어집니다. 과정을 남겨 오답 분석의 효율을 높이겠습니다.',
  },
  {
    id: 'math_proc_05',
    category: 'math',
    tags: ['풀이 과정 생략'],
    text: '머릿속으로만 풀던 습관을 손으로 쓰는 풀이로 바꾸어, 복잡한 문항에서도 흔들리지 않도록 하겠습니다.',
  },
  // 이해도/종합
  {
    id: 'math_gen_01',
    category: 'math',
    tags: ['상'],
    tone: 'praise',
    text: '현재 단원의 개념 이해도가 매우 높아, 심화 응용으로 자연스럽게 확장할 준비가 되어 있습니다.',
  },
  {
    id: 'math_gen_02',
    category: 'math',
    tags: ['하'],
    tone: 'improve',
    text: '현재 단원의 이해도가 아직 충분치 않아, 기본 예제부터 다시 다지며 토대를 단단히 하겠습니다.',
  },
];

// ---------------------------------------------------------------------------
// 통합 배열 및 카운트 단언
// ---------------------------------------------------------------------------
export const allTemplates: FeedbackTemplate[] = [
  ...homeworkTemplates,
  ...directionTemplates,
  ...koreanTemplates,
  ...mathTemplates,
];

// count 단언 (빌드 타임 참고용):
//   homework  = 16  (>= 15)
//   direction = 22  (상승 10 + 하락 10 + 유지 2, >= 20)
//   korean    = 28  (>= 25)
//   math      = 27  (>= 25)
//   total     = 93  (>= 80)

// ---------------------------------------------------------------------------
// 국어 강점·약점 태그별 한 줄 코멘트
// 선생님이 누른 태그가 총평에 그대로 반영되도록 태그마다 문장을 하나씩 둡니다.
// ---------------------------------------------------------------------------
export interface TagNote {
  kind: 'strength' | 'weakness';
  text: string;
}

export const KOREAN_TAG_NOTES: Record<KoreanTag, TagNote> = {
  '지문 구조화 우수': { kind: 'strength', text: '문단 사이의 관계를 잡아 지문 전체 구조를 정리하는 힘이 좋습니다.' },
  '핵심어 포착 능숙': { kind: 'strength', text: '지문에서 반복되는 핵심어를 빠르게 짚어 내고 있습니다.' },
  '선지 근거 찾기 연습 필요': { kind: 'weakness', text: '답을 고를 때 지문 속 근거 문장을 직접 표시하는 연습이 더 필요합니다.' },
  '시간 배분 개선 중': { kind: 'weakness', text: '지문당 풀이 시간을 재며 연습하고 있고, 조금씩 시간이 줄고 있습니다.' },
  '고전 어휘력 보완 필요': { kind: 'weakness', text: '고전 시가와 산문에 자주 나오는 어휘를 따로 정리해 외울 필요가 있습니다.' },
  '현대문학 정서 파악 우수': { kind: 'strength', text: '현대시와 소설에서 화자와 인물의 정서를 정확하게 읽어 냅니다.' },
  '문법 개념 암기 탄탄': { kind: 'strength', text: '문법 개념을 정확하게 기억하고 있어 문제 적용이 안정적입니다.' },
  '화작 담화 분석 안정적': { kind: 'strength', text: '화법과 작문 지문의 말하기 방식과 글쓰기 전략을 안정적으로 분석합니다.' },
  '추론적 사고 강화 필요': { kind: 'weakness', text: '지문에 직접 나오지 않은 내용을 추론하는 문제에서 아직 흔들림이 있습니다.' },
  '배경지식 활용 능숙': { kind: 'strength', text: '이미 알고 있는 배경지식을 지문 이해에 잘 연결합니다.' },
  '오답 근거 설명 연습 필요': { kind: 'weakness', text: '틀린 문제에서 왜 틀렸는지 스스로 설명해 보는 연습을 이어 가겠습니다.' },
  '발표 자신감 상승': { kind: 'strength', text: '풀이 과정을 말로 설명할 때 자신감이 눈에 띄게 늘었습니다.' },
  '어휘력 탄탄': { kind: 'strength', text: '어휘력이 탄탄해 낯선 지문도 막힘없이 읽어 나갑니다.' },
  '지문 요약 능력 향상 중': { kind: 'strength', text: '문단별로 한 줄 요약하는 실력이 꾸준히 늘고 있습니다.' },
  '선지 비교 판단 신중함 필요': { kind: 'weakness', text: '비슷한 선지 두 개가 남았을 때 성급하게 고르는 경향이 있어 신중함이 필요합니다.' },
  '문맥 추론 정확도 우수': { kind: 'strength', text: '앞뒤 문맥으로 낱말과 문장의 의미를 정확하게 추론합니다.' },
  '글의 흐름 파악 능숙': { kind: 'strength', text: '글의 전개 방식과 흐름을 잘 따라갑니다.' },
};

// ---------------------------------------------------------------------------
// 총평 자동 조합: composeOverallComment
// ---------------------------------------------------------------------------

/** 과목별 이번 점수와 직전 점수. */
export interface SubjectScore {
  subject: string;
  latest: number;
  previous?: number;
}

/** 총평 조합 입력. */
export interface ComposeInput {
  /** 학생 이름 (선택). 있으면 '서연이는'처럼 부르는 이름으로 씁니다. */
  studentName?: string;
  /** 선택된 국어 강점·약점 태그. */
  koreanTags?: string[];
  /** 선택된 국어 영역 칩. */
  koreanAreas?: string[];
  /** 선택된 수학 오답 원인. */
  mathErrorCauses?: string[];
  /** 수학 오답 원인별 문항 수. 가장 많은 원인을 먼저 다룹니다. */
  mathErrorCounts?: Record<string, number>;
  /** 수학 진도 단원명. */
  mathUnit?: string;
  /** 수학 이해도. */
  mathUnderstanding?: MathUnderstanding;
  /** 숙제 수행률 (0 ~ 100). */
  homeworkRate?: number;
  /** 과목별 이번/직전 점수. */
  subjectScores?: SubjectScore[];
  /** 수업 집중도 별점 (1 ~ 5). */
  attendanceFocus?: number;
  /**
   * 문장 선택 번호. 같은 입력이라도 값이 바뀌면 다른 템플릿 문장을 고릅니다.
   * 매주 같은 문장이 반복되지 않도록 '다른 문장으로' 버튼에서 1씩 올립니다.
   */
  variant?: number;
}

/** composeOverallComment 반환 구조: 3가지 버전의 총평. */
export interface ComposedComment {
  /** 칭찬 중심. */
  praise: string;
  /** 약점 보완 중심. */
  improve: string;
  /** 균형형. */
  balanced: string;
}

type Trend = 'rise' | 'drop' | 'hold';

/** 이 점수 차이 미만이면 '유지'로 봅니다. 1~2점 변화에 '하락' 문장을 붙이지 않기 위함입니다. */
const TREND_THRESHOLD = 3;

function detectTrend(latest?: number, previous?: number): Trend {
  if (typeof latest !== 'number' || typeof previous !== 'number') {
    return 'hold';
  }
  if (latest - previous >= TREND_THRESHOLD) {
    return 'rise';
  }
  if (previous - latest >= TREND_THRESHOLD) {
    return 'drop';
  }
  return 'hold';
}

/** 받침 유무. 한글이 아니면 받침 없음으로 봅니다. */
function hasBatchim(word: string): boolean {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) {
    return false;
  }
  return code % 28 !== 0;
}

/** '김서연' -> '서연이', '박준호' -> '준호'. 이름이 없으면 '학생'. */
export function callName(fullName?: string): string {
  const name = (fullName ?? '').trim();
  if (!name) {
    return '학생';
  }
  const given = name.length >= 3 ? name.slice(1) : name;
  return hasBatchim(given) ? `${given}이` : given;
}

/** 단어 뒤에 붙는 조사 고르기: 은/는, 이/가, 을/를, 으로/로. */
function josa(word: string, pair: '은는' | '이가' | '을를' | '으로'): string {
  const batchim = hasBatchim(word);
  switch (pair) {
    case '은는':
      return word + (batchim ? '은' : '는');
    case '이가':
      return word + (batchim ? '이' : '가');
    case '을를':
      return word + (batchim ? '을' : '를');
    case '으로': {
      // 'ㄹ' 받침은 '로'
      const code = word.charCodeAt(word.length - 1) - 0xac00;
      const isRieul = code >= 0 && code <= 11171 && code % 28 === 8;
      return word + (batchim && !isRieul ? '으로' : '로');
    }
  }
}

/** variant 와 offset 으로 목록에서 하나를 고릅니다. */
function pick<T>(pool: readonly T[], variant: number, offset = 0): T | undefined {
  if (pool.length === 0) {
    return undefined;
  }
  const i = Math.abs(variant + offset) % pool.length;
  return pool[i];
}

function join(parts: (string | undefined | false)[]): string {
  return parts
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .join(' ');
}

function templatesWithTag(pool: FeedbackTemplate[], tag: string): FeedbackTemplate[] {
  return pool.filter((t) => t.tags?.includes(tag));
}

const CLOSINGS = {
  praise: [
    '지금처럼 잘 따라와 준다면 좋은 결과로 이어질 것이라 생각합니다. 감사합니다.',
    '아이가 스스로 잘하고 있다는 걸 느낄 수 있도록 집에서도 한마디 칭찬 부탁드립니다. 감사합니다.',
    '이 흐름이 이어지도록 다음 주에도 꼼꼼히 챙기겠습니다. 감사합니다.',
  ],
  improve: [
    '부족한 부분은 수업에서 하나씩 짚어 가겠습니다. 집에서는 과제를 마쳤는지만 가볍게 확인해 주시면 충분합니다. 감사합니다.',
    '조급하게 보지 않고 한 단계씩 보완하겠습니다. 궁금하신 점은 언제든 편하게 말씀해 주세요. 감사합니다.',
    '다음 수업에서 이 부분을 집중적으로 다루겠습니다. 감사합니다.',
  ],
  balanced: [
    '잘하는 부분은 살리고 아쉬운 부분은 채워 가며 목표까지 꾸준히 가겠습니다. 감사합니다.',
    '다음 주 수업도 이 방향으로 이어 가겠습니다. 감사합니다.',
    '궁금하신 점은 편하게 연락 주세요. 다음 주에 다시 소식 전하겠습니다. 감사합니다.',
  ],
} as const;

function greeting(call: string, variant: number): string {
  const options = [
    `안녕하세요, 학부모님. ${call}의 이번 주 수업 내용을 정리해 드립니다.`,
    `안녕하세요, 학부모님. 이번 주 ${call} 수업 소식 전해 드립니다.`,
    `안녕하세요, 학부모님. ${call}의 한 주 학습 내용을 말씀드립니다.`,
  ];
  return pick(options, variant) ?? options[0];
}

/** 점수를 숫자 그대로 적어 줍니다. 예: '국어 테스트는 80점에서 88점으로 올랐습니다.' */
function scoreSentence(scores: SubjectScore[]): string {
  const parts = scores.map((s) => {
    const label = `${s.subject} 테스트`;
    if (typeof s.previous !== 'number') {
      return `이번 ${josa(label, '은는')} ${s.latest}점입니다.`;
    }
    const diff = s.latest - s.previous;
    if (diff > 0) {
      return `${josa(label, '은는')} 지난번 ${s.previous}점에서 ${s.latest}점으로 ${diff}점 올랐습니다.`;
    }
    if (diff < 0) {
      return `${josa(label, '은는')} 지난번 ${s.previous}점에서 ${s.latest}점으로 ${-diff}점 내려갔습니다.`;
    }
    return `${josa(label, '은는')} 지난번과 같은 ${s.latest}점입니다.`;
  });
  return parts.join(' ');
}

function homeworkSentence(
  rate: number | undefined,
  tone: 'praise' | 'improve',
  variant: number,
): string {
  if (typeof rate !== 'number') {
    return '';
  }
  if (rate >= 90) {
    return pick(
      [
        '숙제도 빠짐없이 해 와서 수업 진도가 잘 이어지고 있습니다.',
        '과제를 꼼꼼하게 해 오고 있어 수업 시간을 알차게 쓰고 있습니다.',
      ],
      variant,
    ) ?? '';
  }
  if (rate >= 60) {
    return tone === 'praise'
      ? `숙제는 ${rate}% 정도 해 왔고, 꾸준히 하려는 모습이 보입니다.`
      : `숙제는 ${rate}% 정도 해 왔습니다. 남은 부분까지 마무리하면 효과가 더 커질 것입니다.`;
  }
  // 60% 미만은 완곡한 숙제 안내 템플릿을 돌려 가며 씁니다.
  return pick(homeworkTemplates, variant)?.text ?? '';
}

function focusSentence(focus: number | undefined, variant: number): string {
  if (typeof focus !== 'number') {
    return '';
  }
  if (focus >= 5) {
    return pick(
      ['수업 내내 집중력이 아주 좋았습니다.', '이번 주는 수업 태도가 특히 좋았습니다.'],
      variant,
    ) ?? '';
  }
  if (focus === 4) {
    return '수업 중 집중도도 좋은 편이었습니다.';
  }
  if (focus === 3) {
    return '수업 후반에 집중이 조금 흐트러져, 중간에 짧게 쉬어 가며 진행하고 있습니다.';
  }
  return '이번 주는 수업 집중이 다소 어려워 보여, 컨디션을 함께 살피며 진행하겠습니다.';
}

function directionSentence(trend: Trend, variant: number): string {
  const pool = directionTemplates.filter((t) => t.tags?.includes(trend));
  return pick(pool, variant, 1)?.text ?? '';
}

/** 오답 원인을 문항 수 많은 순으로 정렬합니다. 개수가 없으면 선택 순서를 따릅니다. */
function rankedCauses(input: ComposeInput): { cause: string; count: number }[] {
  const counts = input.mathErrorCounts ?? {};
  const causes = new Set<string>([
    ...(input.mathErrorCauses ?? []),
    ...Object.keys(counts).filter((k) => (counts[k] ?? 0) > 0),
  ]);
  return Array.from(causes)
    .map((cause) => ({ cause, count: counts[cause] ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

function mathCauseSentence(input: ComposeInput, variant: number): string[] {
  const ranked = rankedCauses(input);
  if (ranked.length === 0) {
    return [];
  }
  const total = ranked.reduce((sum, r) => sum + r.count, 0);
  const top = ranked[0];
  const out: string[] = [];
  if (top.count > 0 && total > 0) {
    out.push(
      `틀린 ${total}문항 중 ${top.count}문항이 '${top.cause}' 때문이었습니다.`,
    );
  } else {
    out.push(`오답은 주로 '${top.cause}'에서 나왔습니다.`);
  }
  const prescription = pick(templatesWithTag(mathTemplates, top.cause), variant);
  if (prescription) {
    out.push(prescription.text);
  }
  return out;
}

function mathUnderstandingSentence(input: ComposeInput, call: string): string {
  const unit = (input.mathUnit ?? '').trim();
  const u = input.mathUnderstanding;
  if (!u) {
    return '';
  }
  const unitPart = unit ? `${josa(unit, '은는')} ` : '이번 단원은 ';
  if (u === '상') {
    return `${unitPart}개념을 잘 이해하고 있어 응용 문제로 넘어가고 있습니다.`;
  }
  if (u === '중') {
    return `${unitPart}${josa(call, '이가')} 기본 개념은 이해했고, 유형 연습을 더 하면 안정될 것 같습니다.`;
  }
  return `${unitPart}아직 개념이 익숙하지 않아 기본 예제부터 다시 다지고 있습니다.`;
}

function koreanNotes(tags: string[] | undefined, kind: TagNote['kind']): string[] {
  return (tags ?? [])
    .map((t) => KOREAN_TAG_NOTES[t as KoreanTag])
    .filter((n): n is TagNote => Boolean(n) && n.kind === kind)
    .map((n) => n.text);
}

function areaPrescription(areas: string[] | undefined, variant: number): string {
  const first = (areas ?? [])[0];
  if (!first) {
    return '';
  }
  return pick(templatesWithTag(koreanTemplates, first), variant)?.text ?? '';
}

/** 여러 과목 점수 중 대표 추세(하락이 하나라도 있으면 하락 우선)를 구합니다. */
function overallTrend(scores: SubjectScore[]): Trend {
  const trends = scores.map((s) => detectTrend(s.latest, s.previous));
  if (trends.includes('drop')) {
    return 'drop';
  }
  if (trends.includes('rise')) {
    return 'rise';
  }
  return 'hold';
}

/**
 * 선택한 태그/영역/오답 원인, 숙제 수행률, 점수 추세를 바탕으로
 * '칭찬 중심 / 약점 보완 중심 / 균형형' 3가지 총평을 자동 조합합니다.
 * variant 값을 바꾸면 같은 입력에서도 다른 템플릿 문장이 선택됩니다.
 */
export function composeOverallComment(input: ComposeInput): ComposedComment {
  const v = input.variant ?? 0;
  const call = callName(input.studentName);
  const scores = input.subjectScores ?? [];
  const trend = overallTrend(scores);
  const hello = greeting(call, v);
  const scoreLine = scores.length > 0 ? scoreSentence(scores) : '';

  const strengths = [
    ...koreanNotes(input.koreanTags, 'strength'),
    input.mathUnderstanding === '상' ? mathUnderstandingSentence(input, call) : '',
  ].filter(Boolean);

  const weaknesses = [
    ...koreanNotes(input.koreanTags, 'weakness'),
    ...mathCauseSentence(input, v),
    input.mathUnderstanding === '하' ? mathUnderstandingSentence(input, call) : '',
  ].filter(Boolean);

  const neutralMath =
    input.mathUnderstanding === '중' ? mathUnderstandingSentence(input, call) : '';
  const area = areaPrescription(input.koreanAreas, v);
  const direction = directionSentence(trend, v);

  const fallbackStrength = `${josa(call, '은는')} 수업 태도가 성실해 기본기가 잘 잡혀 가고 있습니다.`;
  const fallbackImprove = '이번 주 틀린 문제를 다시 풀어 보며 약한 부분을 확인하겠습니다.';

  const praise = join([
    hello,
    scoreLine,
    strengths.length > 0 ? strengths.slice(0, 3).join(' ') : fallbackStrength,
    neutralMath,
    trend === 'rise' && direction,
    focusSentence(input.attendanceFocus, v),
    homeworkSentence(input.homeworkRate, 'praise', v),
    pick(CLOSINGS.praise, v),
  ]);

  const improve = join([
    hello,
    scoreLine,
    weaknesses.length > 0 ? weaknesses.slice(0, 3).join(' ') : fallbackImprove,
    weaknesses.length < 3 && neutralMath,
    weaknesses.length < 2 && area,
    trend === 'drop' && direction,
    homeworkSentence(input.homeworkRate, 'improve', v),
    pick(CLOSINGS.improve, v),
  ]);

  const balanced = join([
    hello,
    scoreLine,
    strengths[0] ?? fallbackStrength,
    weaknesses.length > 0 ? weaknesses.slice(0, 2).join(' ') : neutralMath || fallbackImprove,
    trend !== 'hold' && direction,
    homeworkSentence(input.homeworkRate, 'improve', v),
    pick(CLOSINGS.balanced, v),
  ]);

  return { praise, improve, balanced };
}
