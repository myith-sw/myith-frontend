import { onboardingAssets } from '../assets/onboarding'

export type OnboardingStep =
  | 'hub'
  | 'archive'
  | 'egg'
  | 'job-selection'
  | 'nickname'
  | 'self-assessment'
  | 'roadmap'
  | 'quest-detail'

export type CategoryId = string

export interface JobCategory {
  id: CategoryId
  label: string
  icon: string
}

export interface JobOption {
  id: JobId
  categoryId: CategoryId
  title: string
  description: string
  skills: string[]
  available?: boolean
}

export type JobId = string

export const jobCategories: JobCategory[] = [
  { id: 'business', label: '경영·사무', icon: onboardingAssets.categoryBusiness },
  { id: 'finance', label: '금융·회계', icon: onboardingAssets.categoryFinance },
  { id: 'sales', label: '영업·해외영업', icon: onboardingAssets.categorySales },
  { id: 'marketing', label: '광고·마케팅', icon: onboardingAssets.categoryMarketing },
  { id: 'it', label: 'IT', icon: onboardingAssets.categoryIt },
  { id: 'research', label: '연구·R&D', icon: onboardingAssets.categoryResearch },
  { id: 'manufacturing', label: '생산·제조', icon: onboardingAssets.categoryManufacturing },
  { id: 'public', label: '공공행정', icon: onboardingAssets.categoryPublic },
  { id: 'other', label: '기타', icon: onboardingAssets.categoryOther },
]

export const marketingJobs: JobOption[] = [
  {
    id: 'digital-marketer',
    categoryId: 'marketing',
    title: '디지털 마케터',
    description: '콘텐츠와 데이터로 고객을 움직인다',
    skills: ['콘텐츠 기획', '퍼포먼스 광고', '데이터 분석', '채널 운영', '브랜딩·카피'],
  },
  {
    id: 'brand-marketer',
    categoryId: 'marketing',
    title: '브랜드 마케터',
    description: '브랜드 경험으로 고객의 기억을 만든다',
    skills: ['브랜드 전략', '시장 리서치', '캠페인 기획', '카피라이팅'],
  },
  {
    id: 'content-marketer',
    categoryId: 'marketing',
    title: '콘텐츠 마케터',
    description: '유용한 이야기로 고객과 관계를 만든다',
    skills: ['콘텐츠 제작', 'SEO', '채널 운영', '성과 분석'],
  },
]

// 분야 탭과 선택 상태를 검증하기 위한 임시 직무 데이터입니다.
// 실제 직무 데이터가 준비되면 API 응답으로 교체할 수 있습니다.
export const demoJobs: JobOption[] = [
  {
    id: 'hr-manager',
    categoryId: 'business',
    title: '인사 담당자',
    description: '사람과 조직이 함께 성장할 수 있는 환경을 만든다',
    skills: ['채용 운영', '조직문화', '인사 제도', '커뮤니케이션'],
  },
  {
    id: 'financial-analyst',
    categoryId: 'finance',
    title: '재무 분석가',
    description: '숫자에서 사업의 흐름과 다음 기회를 찾는다',
    skills: ['재무제표', '예산 관리', '데이터 분석', '리포팅'],
  },
  {
    id: 'overseas-sales',
    categoryId: 'sales',
    title: '해외영업 담당자',
    description: '시장과 고객을 연결해 새로운 거래를 만든다',
    skills: ['시장 조사', '바이어 발굴', '제안서 작성', '협상'],
  },
  {
    id: 'frontend-developer',
    categoryId: 'it',
    title: '프론트엔드 개발자',
    description: '사용자가 바로 느끼는 웹 경험을 구현한다',
    skills: ['HTML·CSS', 'React', 'TypeScript', 'UI 구현'],
  },
  {
    id: 'researcher',
    categoryId: 'research',
    title: '연구원',
    description: '새로운 기술과 가설을 실험으로 증명한다',
    skills: ['문헌 조사', '실험 설계', '데이터 해석', '보고서 작성'],
  },
  {
    id: 'production-manager',
    categoryId: 'manufacturing',
    title: '생산 관리 담당자',
    description: '현장의 흐름을 개선해 안정적인 생산을 만든다',
    skills: ['공정 관리', '품질 개선', '일정 관리', '문제 해결'],
  },
  {
    id: 'public-administrator',
    categoryId: 'public',
    title: '행정 담당자',
    description: '시민에게 필요한 공공 서비스를 기획하고 운영한다',
    skills: ['정책 이해', '민원 응대', '문서 작성', '사업 운영'],
  },
  {
    id: 'product-planner',
    categoryId: 'other',
    title: '서비스 기획자',
    description: '사용자의 문제를 발견하고 더 나은 서비스를 설계한다',
    skills: ['사용자 조사', '기능 기획', '와이어프레임', '프로젝트 관리'],
  },
]

export const availableJobs: JobOption[] = [...marketingJobs, ...demoJobs]

export const digitalMarketer = marketingJobs[0]

export const assessmentLevels = ['모름', '들어봄', '해봄', '혼자 가능'] as const

export type AssessmentLevel = string

export interface AssessmentQuestion {
  id: string
  prompt: string
  initialAnswer: AssessmentLevel
}

export interface AssessmentOption {
  id: string
  label: string
}

export interface ProjectExperience {
  id: string
  description: string
  file: File | null
  link: string
}

export function createEmptyProjectExperience(): ProjectExperience {
  return {
    id: crypto.randomUUID(),
    description: '',
    file: null,
    link: '',
  }
}

export const assessmentQuestions: AssessmentQuestion[] = [
  { id: 'environment', prompt: '개발환경을 구축할 수 있다', initialAnswer: '모름' },
  { id: 'toy-app', prompt: '언어 기초로 토이앱을 만든다', initialAnswer: '들어봄' },
  { id: 'algorithm', prompt: '자료구조·알고리즘 기초를 안다', initialAnswer: '들어봄' },
  { id: 'database', prompt: '데이터베이스를 다룰 수 있다', initialAnswer: '혼자 가능' },
  { id: 'version-control', prompt: '버전관리로 협업한다', initialAnswer: '들어봄' },
  { id: 'rest-api', prompt: 'REST API 서버를 구현한다', initialAnswer: '모름' },
  { id: 'security', prompt: '인증·보안 기초를 적용한다', initialAnswer: '모름' },
  { id: 'testing', prompt: '테스트 코드를 작성한다', initialAnswer: '모름' },
]

export const initialAssessmentAnswers = Object.fromEntries(
  assessmentQuestions.map(({ id, initialAnswer }) => [id, initialAnswer]),
) as Record<string, AssessmentLevel>
