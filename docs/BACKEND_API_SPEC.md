# MYITH 백엔드 연동 및 API 명세 초안

> 작성 기준: `myith-frontend` `main@7ab1489`  
> 작성일: 2026-07-24  
> 목적: 프론트엔드와 백엔드의 연동 범위 확정, OpenAPI 작성, DB 모델링, 개발 일정 산정

## 1. 문서 사용 방법

이 문서는 현재 구현된 프론트엔드 화면과 상태 흐름을 기준으로 작성한 백엔드 계약 초안이다.

- BE는 이 문서를 기반으로 OpenAPI 3.1 문서를 작성한다.
- FE와 BE는 `19. 구현 전 확정할 항목`을 먼저 합의한다.
- 합의 이후 변경된 필드명, enum, 상태 전이는 OpenAPI를 단일 기준으로 관리한다.
- 현재 화면에 없는 회원가입, 관리자 기능, 알림 기능은 이 문서의 필수 범위에 포함하지 않는다.

## 2. 현재 프론트엔드 상태

### 2.1 기술 구성

- Vite
- React 19
- TypeScript
- Tailwind CSS 4
- npm
- React Router 미사용
- API 클라이언트, 서버 상태 라이브러리 미사용

### 2.2 현재 데이터 저장 방식

현재 모든 데이터는 정적 TypeScript 배열 또는 React 메모리 상태에만 존재한다.

| 기능 | 현재 데이터 위치 | 새로고침 결과 |
| --- | --- | --- |
| 신화 허브 캐릭터 목록 | `src/data/home.ts` | 정적 샘플로 복원 |
| egg·직무·닉네임 선택 | `App.tsx` state | 초기화 |
| 자가진단 답변 | `App.tsx` state | 초기화 |
| 생성한 캐릭터 | draft state | 소실 |
| 로드맵 | `src/data/roadmap.ts` | 정적 템플릿으로 복원 |
| 사용자 추가 퀘스트 | `App.tsx` state | 소실 |
| 퀘스트 STAR 기록 | `QuestDetailPage` state | 소실 |
| AI 보완 결과 | 4초 후 고정 mock | 소실 |
| 역량 점수 | 정적 데이터 또는 FE 계산 | 복원/소실 |
| 경험 카드 | `src/data/archive.ts` | 정적 샘플로 복원 |
| MD/PDF 내보내기 | 버튼 UI만 존재 | 동작 없음 |

### 2.3 백엔드 연동이 필요한 핵심 기능

1. 사용자 또는 게스트 세션 식별
2. 직무·자가진단·로드맵 템플릿 조회
3. 캐릭터 생성 및 영구 저장
4. 캐릭터별 로드맵·퀘스트 조회
5. 사용자 정의 퀘스트 생성
6. STAR 기록 임시 저장 및 완료 처리
7. AI STAR 보완
8. 퀘스트 완료에 따른 진행률·레벨·역량 갱신
9. 아카이브·경험 카드 조회
10. MD/PDF 내보내기

## 3. 권장 API 공통 규칙

### 3.1 기본 규칙

| 항목 | 권장값 |
| --- | --- |
| Base path | `/api/v1` |
| Content-Type | `application/json; charset=utf-8` |
| 필드 이름 | `camelCase` |
| 시간 | ISO 8601 UTC, 예: `2026-07-24T04:30:00Z` |
| 리소스 ID | 서버 생성 UUID 문자열 |
| 마스터 데이터 ID | 변경되지 않는 영문 slug |
| 인증 | HttpOnly cookie 기반 세션 권장 |
| 페이지네이션 | cursor 기반 |
| 문서 | OpenAPI 3.1 + Swagger UI |

프론트엔드의 캐릭터 이미지 파일은 앱 번들에 포함되어 있다. BE는 이미지 URL이나 바이너리를 내려주지 않고 `spriteId`와 `stage`만 반환한다.

### 3.2 성공 응답

단일 리소스:

```json
{
  "data": {
    "id": "resource-id"
  }
}
```

목록:

```json
{
  "data": [],
  "meta": {
    "nextCursor": null,
    "hasNext": false
  }
}
```

### 3.3 오류 응답

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값을 확인해주세요.",
    "fieldErrors": {
      "nickname": "닉네임은 1자 이상이어야 합니다."
    },
    "requestId": "req_01J3..."
  }
}
```

권장 상태 코드:

| 상태 코드 | 용도 |
| --- | --- |
| `200` | 조회·수정 성공 |
| `201` | 생성 성공 |
| `204` | 응답 본문이 없는 성공 |
| `400` | JSON 형식, query, enum 오류 |
| `401` | 인증 또는 세션 없음 |
| `403` | 다른 사용자의 리소스 접근 |
| `404` | 리소스 없음 |
| `409` | 잠긴 퀘스트, 이미 완료, 상태 충돌 |
| `422` | 필드 검증 실패 |
| `429` | AI 요청 횟수 제한 |
| `500` | 처리되지 않은 서버 오류 |
| `502` | AI 등 외부 서비스 오류 |
| `503` | 일시적인 서비스 장애 |

### 3.4 멱등성과 동시성

- 캐릭터 생성과 퀘스트 완료 요청은 `Idempotency-Key` 헤더를 지원한다.
- 동일 key로 재요청하면 중복 캐릭터·경험 카드가 만들어지지 않아야 한다.
- 수정 응답에는 항상 `updatedAt`을 포함한다.
- 추후 여러 기기 동시 편집이 필요하면 `version` 또는 `If-Match`를 추가한다.

## 4. 인증과 사용자 식별

현재 로그인 화면이 없으므로 MVP에서는 게스트 세션을 권장한다.

### 4.1 권장 흐름

1. 앱 시작 시 `POST /api/v1/auth/guest` 호출
2. 서버가 기존 cookie를 확인하고, 없으면 게스트 사용자를 생성
3. 서버가 `HttpOnly`, `Secure`, `SameSite=Lax` cookie 발급
4. 이후 모든 요청에 `credentials: include` 사용
5. 정식 로그인 도입 시 게스트 데이터를 계정으로 이전

### 4.2 API

#### `POST /api/v1/auth/guest`

요청 본문 없음.

응답:

```json
{
  "data": {
    "userId": "1f4e03e1-c3c4-4b2a-a1c4-bc2e0c22e412",
    "type": "guest",
    "createdAt": "2026-07-24T04:30:00Z"
  }
}
```

#### `GET /api/v1/me`

```json
{
  "data": {
    "id": "1f4e03e1-c3c4-4b2a-a1c4-bc2e0c22e412",
    "type": "guest"
  }
}
```

이미 별도 인증 서버나 소셜 로그인을 사용하기로 했다면 위 두 endpoint를 해당 인증 방식으로 교체한다.

## 5. 공통 enum과 식별자

### 5.1 캐릭터 이미지

```ts
type CharacterStage = 1 | 2 | 3 | 4
```

지원하는 `spriteId`:

```text
ppareutazzo, pungjanggun, progul, kokkoburi, napalliong,
seureureukeu, chamchamdomi, soongeo, akcroco, gashideoduji,
oguri, teoreuteu, deokbaseu, chiruring, torukuk, migeo,
tugeolbi, domarion, yeoneo, toroyong, igeuligeul, eojingeo
```

현재 온보딩에서 선택할 수 있는 egg:

```text
teoreuteu, migeo, soongeo
```

`userCharacterId`와 `spriteId`는 서로 다른 값이다.

- `userCharacterId`: 사용자 캐릭터 DB PK
- `spriteId`: 로컬 이미지 선택용 slug

### 5.2 역량

```ts
type CompetencyKey =
  | 'programming'
  | 'computerScience'
  | 'database'
  | 'serverApi'
  | 'collaboration'
  | 'deployment'
```

모든 점수는 `0~100` 정수다.

| key | 표시명 |
| --- | --- |
| `programming` | 프로그래밍 기초 |
| `computerScience` | CS·자료구조 |
| `database` | 데이터베이스 |
| `serverApi` | 서버·API |
| `collaboration` | 협업·형상관리 |
| `deployment` | 배포·운영 |

### 5.3 자가진단 수준

API에서는 UI 문구 대신 고정 enum을 사용한다.

| API enum | UI 문구 | 기본 점수 |
| --- | --- | --- |
| `unknown` | 모름 | 0 |
| `heard` | 들어봄 | 33 |
| `tried` | 해봄 | 67 |
| `independent` | 혼자 가능 | 100 |

### 5.4 퀘스트 상태

```ts
type QuestStatus = 'complete' | 'pending' | 'open' | 'locked'
```

| 상태 | 의미 |
| --- | --- |
| `open` | 시작 가능한 퀘스트 |
| `pending` | 기록을 시작했지만 완료하지 않은 퀘스트 |
| `complete` | 완료된 퀘스트 |
| `locked` | 선행 조건 미충족 |

권장 상태 전이:

```text
locked -> open -> pending -> complete
```

- 최초 STAR 기록 저장 시 `open -> pending`
- 완료 API 성공 시 `pending/open -> complete`
- 선행 레벨 완료 시 다음 퀘스트 `locked -> open`
- `complete` 상태를 되돌리는 기능은 현재 범위에 포함하지 않는다.

## 6. 주요 데이터 모델

### 6.1 `StarRecord`

```ts
interface StarRecord {
  situation: string
  task: string
  action: string
  result: string
}
```

### 6.2 `CompetencyScores`

```ts
interface CompetencyScores {
  programming: number
  computerScience: number
  database: number
  serverApi: number
  collaboration: number
  deployment: number
}
```

### 6.3 `UserCharacterSummary`

```ts
interface UserCharacterSummary {
  id: string
  nickname: string
  job: {
    id: string
    title: string
  }
  spriteId: string
  level: number
  stage: 1 | 2 | 3 | 4
  stageLabel: string
  description: string
  progress: number
  completedQuestCount: number
  nextQuest: {
    id: string
    title: string
  } | null
  competencies: CompetencyScores
  createdAt: string
  updatedAt: string
}
```

### 6.4 `QuestSummary`

```ts
interface QuestSummary {
  id: string
  level: number
  competencyKey: CompetencyKey
  categoryLabel: string
  title: string
  status: QuestStatus
  isCustom: boolean
  order: number
}
```

### 6.5 `QuestDetail`

```ts
interface QuestDetail extends QuestSummary {
  completionCriteria: string
  ncsReferences: Array<{
    code: string | null
    name: string
    url: string | null
  }>
  recommendedCertificates: Array<{
    id: string
    name: string
  }>
  record: StarRecord | null
  recordSource: 'manual' | 'ai-assisted' | null
  updatedAt: string
}
```

### 6.6 권장 DB 테이블

| 테이블 | 주요 필드 |
| --- | --- |
| `users` | id, type, created_at |
| `job_categories` | id, label, sort_order |
| `jobs` | id, category_id, title, description |
| `job_skills` | id, job_id, label, sort_order |
| `assessment_questions` | id, job_id, prompt, competency_key, sort_order |
| `roadmap_templates` | id, job_id, version |
| `quest_templates` | id, roadmap_template_id, level, competency_key, title, prerequisites |
| `user_characters` | id, user_id, nickname, job_id, sprite_id, level, stage, progress |
| `assessment_answers` | id, character_id, question_id, level, score |
| `roadmaps` | id, character_id, template_id, template_version |
| `quests` | id, roadmap_id, template_quest_id, title, level, status, is_custom, sort_order |
| `quest_records` | id, quest_id, situation, task, action, result, source, version |
| `ai_enhancements` | id, quest_id, input_record, output_record, provider, model, status |
| `competency_scores` | character_id, competency_key, score, updated_at |
| `experience_cards` | id, character_id, quest_id, record_snapshot, created_at |

## 7. API 전체 목록

| Method | Path | 화면/기능 |
| --- | --- | --- |
| `POST` | `/auth/guest` | 게스트 세션 생성 |
| `GET` | `/me` | 현재 사용자 확인 |
| `GET` | `/catalog/eggs` | egg 선택 |
| `GET` | `/catalog/job-categories` | 분야 탭 |
| `GET` | `/catalog/jobs` | 직무 카드 목록 |
| `GET` | `/catalog/jobs/{jobId}` | 선택 직무 정보 |
| `GET` | `/catalog/jobs/{jobId}/assessment` | 직무별 자가진단 |
| `GET` | `/characters` | 신화 허브·사이드바 |
| `POST` | `/characters` | 캐릭터·초기 로드맵 생성 |
| `GET` | `/characters/{characterId}` | 캐릭터 기본 정보 |
| `GET` | `/characters/{characterId}/roadmap` | 로드맵 |
| `POST` | `/characters/{characterId}/quests` | 사용자 퀘스트 추가 |
| `GET` | `/quests/{questId}` | 퀘스트 상세 |
| `PUT` | `/quests/{questId}/record` | STAR 임시 저장 |
| `POST` | `/quests/{questId}/ai-enhancements` | AI 보완 |
| `POST` | `/quests/{questId}/complete` | 퀘스트 완료 |
| `GET` | `/characters/{characterId}/archive` | 역량·스킬 트리 |
| `GET` | `/characters/{characterId}/experiences` | 경험 카드 목록 |
| `GET` | `/characters/{characterId}/archive/export` | MD/PDF 내보내기 |
| `GET` | `/health` | 배포 상태 확인 |

## 8. 직무·온보딩 API

### 8.1 `GET /api/v1/catalog/eggs`

응답:

```json
{
  "data": [
    {
      "id": "teoreuteu",
      "name": "터르트",
      "enabled": true
    },
    {
      "id": "migeo",
      "name": "미거",
      "enabled": true
    },
    {
      "id": "soongeo",
      "name": "소옹어",
      "enabled": true
    }
  ]
}
```

이미지 경로와 Figma URL은 응답에 포함하지 않는다.

### 8.2 `GET /api/v1/catalog/job-categories`

```json
{
  "data": [
    {
      "id": "marketing",
      "label": "광고·마케팅",
      "sortOrder": 4
    },
    {
      "id": "it",
      "label": "IT",
      "sortOrder": 5
    }
  ]
}
```

현재 FE가 사용하는 category ID:

```text
business, finance, sales, marketing, it,
research, manufacturing, public, other
```

### 8.3 `GET /api/v1/catalog/jobs?categoryId=marketing`

```json
{
  "data": [
    {
      "id": "digital-marketer",
      "categoryId": "marketing",
      "title": "디지털 마케터",
      "description": "콘텐츠와 데이터로 고객을 움직인다",
      "skills": [
        "콘텐츠 기획",
        "퍼포먼스 광고",
        "데이터 분석",
        "채널 운영",
        "브랜딩·카피"
      ],
      "enabled": true
    }
  ]
}
```

- `enabled=false`인 직무는 준비중 카드로 표시할 수 있다.
- 직무의 title을 식별자로 사용하지 않고 반드시 `jobId`를 사용한다.

### 8.4 `GET /api/v1/catalog/jobs/{jobId}/assessment`

```json
{
  "data": {
    "jobId": "backend-developer",
    "version": 1,
    "questions": [
      {
        "id": "environment",
        "prompt": "개발환경을 구축할 수 있다",
        "competencyKey": "programming",
        "sortOrder": 1
      },
      {
        "id": "rest-api",
        "prompt": "REST API 서버를 구현한다",
        "competencyKey": "serverApi",
        "sortOrder": 6
      }
    ],
    "levels": [
      {
        "id": "unknown",
        "label": "모름",
        "score": 0
      },
      {
        "id": "heard",
        "label": "들어봄",
        "score": 33
      },
      {
        "id": "tried",
        "label": "해봄",
        "score": 67
      },
      {
        "id": "independent",
        "label": "혼자 가능",
        "score": 100
      }
    ]
  }
}
```

현재 프론트의 8개 질문은 모든 직무에서 동일하게 보이는 임시 백엔드 개발 기준 데이터다. 실제 연동 시 반드시 직무별 질문을 내려줘야 한다.

## 9. 캐릭터 생성과 신화 허브

### 9.1 `POST /api/v1/characters`

자가진단 완료 후 캐릭터, 초기 역량, 로드맵, 퀘스트를 한 트랜잭션으로 생성한다.

요청:

```json
{
  "nickname": "견습 서버 개발자",
  "jobId": "backend-developer",
  "eggId": "teoreuteu",
  "assessmentVersion": 1,
  "assessmentAnswers": [
    {
      "questionId": "environment",
      "level": "tried"
    },
    {
      "questionId": "rest-api",
      "level": "unknown"
    }
  ]
}
```

검증:

- `nickname`: trim 후 1~20자
- `jobId`: 활성 직무여야 함
- `eggId`: 활성 egg여야 함
- 모든 필수 자가진단 질문에 답해야 함
- question과 level은 해당 assessment version에 존재해야 함

응답 `201`:

```json
{
  "data": {
    "character": {
      "id": "char_01J3...",
      "nickname": "견습 서버 개발자",
      "job": {
        "id": "backend-developer",
        "title": "백엔드 개발자"
      },
      "spriteId": "teoreuteu",
      "level": 1,
      "stage": 1,
      "stageLabel": "입문 단계",
      "description": "서버, API, DB로 서비스의 뼈대를 만든다",
      "progress": 5,
      "completedQuestCount": 0,
      "nextQuest": {
        "id": "quest_01J3...",
        "title": "개발환경을 구축할 수 있다"
      },
      "competencies": {
        "programming": 67,
        "computerScience": 33,
        "database": 100,
        "serverApi": 0,
        "collaboration": 33,
        "deployment": 0
      },
      "createdAt": "2026-07-24T04:30:00Z",
      "updatedAt": "2026-07-24T04:30:00Z"
    },
    "roadmapId": "roadmap_01J3..."
  }
}
```

### 9.2 `GET /api/v1/characters`

신화 허브 카드와 사이드바가 함께 사용하는 목록이다.

```json
{
  "data": [
    {
      "id": "char_01J3...",
      "nickname": "견습 서버 개발자",
      "job": {
        "id": "backend-developer",
        "title": "백엔드 개발자"
      },
      "spriteId": "deokbaseu",
      "level": 4,
      "stage": 4,
      "stageLabel": "전설 단계",
      "description": "서버, API, DB로 서비스의 뼈대를 만든다",
      "progress": 80,
      "completedQuestCount": 7,
      "nextQuest": {
        "id": "quest_rest_api",
        "title": "REST API 구조 이해하기"
      },
      "competencies": {
        "programming": 67,
        "computerScience": 80,
        "database": 18,
        "serverApi": 67,
        "collaboration": 90,
        "deployment": 10
      },
      "createdAt": "2026-07-20T02:00:00Z",
      "updatedAt": "2026-07-24T03:00:00Z"
    }
  ]
}
```

### 9.3 `GET /api/v1/characters/{characterId}`

캐릭터 프로필 전체를 반환한다. 다른 사용자의 캐릭터에는 `403`을 반환한다.

## 10. 로드맵·퀘스트 API

### 10.1 `GET /api/v1/characters/{characterId}/roadmap`

```json
{
  "data": {
    "id": "roadmap_01J3...",
    "templateVersion": 1,
    "character": {
      "id": "char_01J3...",
      "nickname": "견습 서버 개발자",
      "jobTitle": "백엔드 개발자",
      "description": "서버, API, DB로 서비스의 뼈대를 만든다",
      "spriteId": "deokbaseu",
      "level": 4,
      "stage": 4,
      "stageLabel": "전설 단계",
      "progress": 80
    },
    "groups": [
      {
        "level": 1,
        "label": "입문 단계",
        "quests": [
          {
            "id": "quest_environment",
            "level": 1,
            "competencyKey": "programming",
            "categoryLabel": "프로그래밍 기초",
            "title": "개발환경을 구축할 수 있다",
            "status": "complete",
            "isCustom": false,
            "order": 1
          }
        ]
      }
    ],
    "updatedAt": "2026-07-24T03:00:00Z"
  }
}
```

- `groups`는 level 오름차순이다.
- `quests`는 order 오름차순이다.
- FE는 status를 계산하지 않고 서버 응답을 그대로 표시한다.
- 잠긴 퀘스트도 목록에 포함한다.

### 10.2 `POST /api/v1/characters/{characterId}/quests`

사용자 정의 퀘스트 추가.

요청:

```json
{
  "title": "사이드 프로젝트를 운영한다",
  "level": 3,
  "competencyKey": "serverApi"
}
```

검증:

- title: 1~80자
- level: 1~6 정수
- competencyKey: 지원 enum
- 선택 level이 잠겨 있으면 서버가 `status=locked`로 생성

응답 `201`:

```json
{
  "data": {
    "id": "quest_01J3...",
    "level": 3,
    "competencyKey": "serverApi",
    "categoryLabel": "서버·API",
    "title": "사이드 프로젝트를 운영한다",
    "status": "open",
    "isCustom": true,
    "order": 4
  }
}
```

### 10.3 `GET /api/v1/quests/{questId}`

```json
{
  "data": {
    "id": "quest_01J3...",
    "level": 5,
    "competencyKey": "computerScience",
    "categoryLabel": "CS·자료구조",
    "title": "CS 면접 질문을 정리한다",
    "status": "open",
    "isCustom": false,
    "order": 1,
    "completionCriteria": "네트워크·OS·DB 핵심 답안을 정리한다",
    "ncsReferences": [],
    "recommendedCertificates": [],
    "record": {
      "situation": "",
      "task": "",
      "action": "",
      "result": ""
    },
    "recordSource": "manual",
    "updatedAt": "2026-07-24T03:00:00Z"
  }
}
```

- locked 퀘스트 조회는 가능하나 기록 수정·완료는 불가능하다.
- 잠긴 퀘스트 수정 시 `409 QUEST_LOCKED`를 반환한다.

## 11. STAR 기록 저장과 완료

### 11.1 `PUT /api/v1/quests/{questId}/record`

명시적인 저장 버튼이 없으므로 FE는 textarea blur 또는 500~1000ms debounce로 이 API를 호출한다.

요청:

```json
{
  "record": {
    "situation": "언어 문법은 봤지만 직접 만들어본 적이 없어 감이 없었다.",
    "task": "자바로 동작하는 콘솔 CRUD 토이앱을 만들기로 했다.",
    "action": "메모 추가·조회·수정·삭제 기능을 구현했다.",
    "result": "클래스 분리와 입력 검증의 필요성을 체감했다."
  },
  "source": "manual",
  "aiEnhancementId": null
}
```

검증:

- 각 필드 trim 후 0~2000자
- 임시 저장에서는 빈 필드를 허용
- `source=ai-assisted`이면 유효한 `aiEnhancementId`를 허용

응답:

```json
{
  "data": {
    "questId": "quest_01J3...",
    "record": {
      "situation": "언어 문법은 봤지만 직접 만들어본 적이 없어 감이 없었다.",
      "task": "자바로 동작하는 콘솔 CRUD 토이앱을 만들기로 했다.",
      "action": "메모 추가·조회·수정·삭제 기능을 구현했다.",
      "result": "클래스 분리와 입력 검증의 필요성을 체감했다."
    },
    "source": "manual",
    "status": "pending",
    "updatedAt": "2026-07-24T04:30:00Z"
  }
}
```

### 11.2 `POST /api/v1/quests/{questId}/complete`

퀘스트 완료, 역량 갱신, 경험 카드 생성을 한 트랜잭션으로 처리한다.

요청:

```json
{
  "record": {
    "situation": "언어 문법은 봤지만 직접 만들어본 적이 없어 감이 없었다.",
    "task": "자바로 동작하는 콘솔 CRUD 토이앱을 만들기로 했다.",
    "action": "메모 추가·조회·수정·삭제 기능을 구현했다.",
    "result": "클래스 분리와 입력 검증의 필요성을 체감했다."
  },
  "source": "ai-assisted",
  "aiEnhancementId": "ai_01J3..."
}
```

검증:

- 네 STAR 필드 모두 trim 후 1~2000자
- locked 퀘스트는 완료할 수 없음
- 이미 complete면 동일 `Idempotency-Key` 요청은 기존 결과 반환

응답:

```json
{
  "data": {
    "quest": {
      "id": "quest_01J3...",
      "status": "complete",
      "completedAt": "2026-07-24T04:30:00Z"
    },
    "characterChanges": {
      "level": 4,
      "stage": 4,
      "stageLabel": "전설 단계",
      "progress": 84,
      "completedQuestCount": 8,
      "competencies": {
        "programming": 72,
        "computerScience": 80,
        "database": 18,
        "serverApi": 67,
        "collaboration": 90,
        "deployment": 10
      },
      "nextQuest": {
        "id": "quest_testing",
        "title": "테스트 코드를 작성한다"
      }
    },
    "unlockedQuestIds": [
      "quest_deployment"
    ],
    "experienceCardId": "experience_01J3..."
  }
}
```

서버 트랜잭션 범위:

1. STAR 최종본 저장
2. quest 상태 complete 변경
3. 경험 카드 snapshot 생성
4. 역량 점수 재계산
5. 캐릭터 진행률·레벨·stage 재계산
6. 다음 퀘스트 잠금 해제
7. nextQuest 갱신

## 12. AI 보완 API

### 12.1 `POST /api/v1/quests/{questId}/ai-enhancements`

현재 UI는 동기 응답 방식이면 충분하다. 서버 응답을 기다리는 동안 프론트가 shimmer 또는 파티클 애니메이션을 표시한다.

요청:

```json
{
  "record": {
    "situation": "CS 면접 준비를 하고 있다.",
    "task": "질문을 정리한다.",
    "action": "답변을 작성했다.",
    "result": "공부가 되었다."
  },
  "locale": "ko-KR",
  "style": "concise-professional"
}
```

검증:

- 네 필드 모두 1~2000자
- 입력 전문을 로그에 남길지 개인정보 정책 확인 필요
- 사용자의 리소스가 아니면 `403`
- locked 퀘스트면 `409 QUEST_LOCKED`

응답:

```json
{
  "data": {
    "id": "ai_01J3...",
    "questId": "quest_01J3...",
    "enhancedRecord": {
      "situation": "CS 면접 준비 과정에서 네트워크·운영체제·데이터베이스 개념을 공부했지만 핵심을 구조적으로 설명하는 데 어려움을 느꼈다.",
      "task": "자주 출제되는 질문을 주제별로 선별하고 실제 사례를 포함한 답변을 정리하기로 했다.",
      "action": "영역별 질문을 수집하고 답변을 정의·원리·활용 사례 순서로 작성한 뒤 반복해서 설명했다.",
      "result": "핵심 개념을 짧고 논리적으로 설명하고 부족한 영역을 반복 학습할 수 있는 답변 자료를 완성했다."
    },
    "provider": "provider-name",
    "model": "model-name",
    "createdAt": "2026-07-24T04:30:00Z"
  }
}
```

권장 오류 code:

| code | 상황 |
| --- | --- |
| `AI_INPUT_TOO_LONG` | 허용 글자 수 초과 |
| `AI_RATE_LIMITED` | 사용자별 호출 제한 |
| `AI_SAFETY_REJECTED` | 정책상 처리 불가 |
| `AI_PROVIDER_TIMEOUT` | 외부 AI timeout |
| `AI_PROVIDER_UNAVAILABLE` | 외부 AI 장애 |

`429` 응답에는 재시도 시점을 포함한다.

```json
{
  "error": {
    "code": "AI_RATE_LIMITED",
    "message": "잠시 후 다시 시도해주세요.",
    "requestId": "req_01J3..."
  },
  "meta": {
    "retryAfterSeconds": 30
  }
}
```

현재 구현의 4초 delay와 고정 문장은 API 연결 시 제거한다. 애니메이션 최소 노출 시간은 FE 책임이며 BE가 인위적으로 응답을 늦추지 않는다.

AI 응답이 일반적으로 30초 이상 걸리면 동기 API 대신 job 생성·polling 또는 SSE 방식으로 별도 개편한다.

## 13. 아카이브와 경험 카드

### 13.1 `GET /api/v1/characters/{characterId}/archive`

```json
{
  "data": {
    "character": {
      "id": "char_01J3...",
      "nickname": "견습 서버 개발자",
      "jobTitle": "백엔드 개발자",
      "level": 4,
      "progress": 80,
      "completedQuestCount": 7
    },
    "competencies": {
      "programming": 67,
      "computerScience": 80,
      "database": 18,
      "serverApi": 67,
      "collaboration": 90,
      "deployment": 10
    },
    "skillGroups": [
      {
        "level": 1,
        "label": "입문 단계",
        "skills": [
          {
            "questId": "quest_environment",
            "competencyKey": "programming",
            "categoryLabel": "프로그래밍 기초",
            "title": "개발환경을 구축할 수 있다",
            "status": "complete"
          }
        ]
      }
    ],
    "updatedAt": "2026-07-24T04:30:00Z"
  }
}
```

역량 점수와 진행률은 FE가 다시 계산하지 않는다.

### 13.2 `GET /api/v1/characters/{characterId}/experiences?limit=20&cursor=...`

```json
{
  "data": [
    {
      "id": "experience_01J3...",
      "questId": "quest_toy_app",
      "competencyKey": "programming",
      "categoryLabel": "프로그래밍 기초",
      "title": "언어 기초로 토이앱을 만든다",
      "record": {
        "situation": "언어 문법은 봤지만 직접 만들어본 적이 없어 감이 없었다.",
        "task": "자바로 동작하는 콘솔 CRUD 토이앱을 만들기로 했다.",
        "action": "메모 추가·조회·수정·삭제 기능을 구현했다.",
        "result": "클래스 분리와 입력 검증의 필요성을 체감했다."
      },
      "createdAt": "2026-07-24T04:30:00Z"
    }
  ],
  "meta": {
    "nextCursor": null,
    "hasNext": false
  }
}
```

경험 카드는 완료 당시 STAR 내용의 snapshot이다. 이후 quest record를 수정하더라도 과거 경험 카드가 자동 변경되지 않도록 한다.

## 14. MD/PDF 내보내기

### `GET /api/v1/characters/{characterId}/archive/export?format=md`

지원 format:

```text
md, pdf
```

성공 응답:

- MD: `Content-Type: text/markdown; charset=utf-8`
- PDF: `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename*=UTF-8''...`

오류:

- 지원하지 않는 format: `400 INVALID_EXPORT_FORMAT`
- 경험 카드 없음: 기본값은 `409 NO_EXPORTABLE_EXPERIENCE`; 빈 문서 제공이 필요하면 제품 합의 후 변경
- 생성 실패: `500 EXPORT_GENERATION_FAILED`

PDF 생성이 오래 걸리면 추후 비동기 export job 방식으로 변경한다. MVP에서는 동기 download를 권장한다.

## 15. 서버가 책임져야 하는 계산

다음 값은 여러 화면에서 동일해야 하므로 서버가 단일 기준으로 계산한다.

- 캐릭터 level
- 이미지 stage
- stageLabel
- 전체 progress
- completedQuestCount
- competencies
- nextQuest
- 퀘스트 잠금·해제 상태
- 경험 카드 생성 여부

### 15.1 현재 FE의 자가진단 계산

현재 임시 계산:

- `unknown=0`
- `heard=33`
- `tried=67`
- `independent=100`
- 동일 역량 질문의 평균을 반올림
- 배포·운영 질문이 없으면 0

서버 도입 후에는 질문별 `competencyKey`와 score를 사용해 서버가 계산한다.

### 15.2 레벨과 이미지 stage

캐릭터 이미지는 4단계만 존재하지만 로드맵은 Lv.1~Lv.6이다.

현재 UI와 호환되는 기본 매핑:

| level | stage | stageLabel |
| --- | --- | --- |
| 1 | 1 | 입문 단계 |
| 2 | 2 | 견습 단계 |
| 3 | 3 | 성장 단계 |
| 4~5 | 4 | 전설 단계 |
| 6 | 4 | 신화 단계 |

Lv.6 전용 이미지가 추가되면 `CharacterStage`와 에셋 계약을 함께 변경해야 한다.

### 15.3 nextQuest 기본 규칙

별도 제품 규칙이 없다면 아래 순서를 권장한다.

1. `pending` 중 level·order가 가장 낮은 퀘스트
2. 없으면 `open` 중 level·order가 가장 낮은 퀘스트
3. 모두 완료했다면 `null`

## 16. 프론트엔드 연동 계획

### 16.1 환경 변수

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Vite의 `VITE_*` 값은 빌드 시점에 번들에 포함된다. Vercel 환경별로 Development, Preview, Production 값을 각각 설정해야 한다.

### 16.2 추가할 FE 계층

```text
src/api/client.ts
src/api/auth.ts
src/api/catalog.ts
src/api/characters.ts
src/api/roadmaps.ts
src/api/quests.ts
src/api/archive.ts
src/types/api.ts
```

권장 client 책임:

- base URL 결합
- JSON 직렬화
- `credentials: include`
- 공통 error parsing
- AbortSignal 전달
- 401 처리
- requestId 로깅

### 16.3 화면별 호출 순서

#### 앱 시작

```text
POST /auth/guest
GET /characters
```

#### 새 캐릭터

```text
GET /catalog/eggs
GET /catalog/job-categories
GET /catalog/jobs?categoryId=...
GET /catalog/jobs/{jobId}/assessment
POST /characters
```

#### 신화 허브

```text
GET /characters
```

#### 로드맵

```text
GET /characters/{characterId}/roadmap
POST /characters/{characterId}/quests
```

#### 퀘스트 상세

```text
GET /quests/{questId}
PUT /quests/{questId}/record
POST /quests/{questId}/ai-enhancements
POST /quests/{questId}/complete
```

#### 아카이브

```text
GET /characters/{characterId}/archive
GET /characters/{characterId}/experiences
GET /characters/{characterId}/archive/export?format=...
```

## 17. CORS·배포·운영 정보

BE가 FE에 제공해야 하는 값:

| 환경 | 필요한 정보 |
| --- | --- |
| Local | API URL, local cookie/CORS 정책 |
| Preview | Vercel preview origin 허용 방식 |
| Production | production API URL, 허용 origin |

현재 production FE 후보 origin:

```text
https://myith-frontend.vercel.app
```

cookie 인증 사용 시:

- FE fetch에 `credentials: include`
- BE CORS에 정확한 origin 명시
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Origin: *` 사용 금지
- 서로 다른 site를 사용하면 `SameSite=None; Secure` 검토

필수 운영 endpoint:

#### `GET /api/v1/health`

```json
{
  "status": "ok",
  "version": "2026.07.24",
  "time": "2026-07-24T04:30:00Z"
}
```

로그에 포함할 값:

- requestId
- userId
- endpoint
- status code
- latency
- AI provider latency와 오류 code

STAR 전문과 AI 원문은 개인정보가 될 수 있으므로 기본 로그에서 제외하거나 마스킹한다.

## 18. BE OpenAPI 완료 조건

BE는 구현 전 다음 결과물을 공유한다.

- OpenAPI 3.1 JSON 또는 YAML
- Swagger UI URL
- Local/Preview/Production base URL
- 인증 cookie 또는 token 규칙
- 모든 enum 목록
- 공통 error schema
- endpoint별 request/response example
- validation 제한
- CORS 허용 origin
- AI timeout·rate limit·재시도 정책
- MD/PDF 응답 header 예시
- seed 데이터 버전

계약 테스트 권장:

- BE: OpenAPI schema validation
- FE: mock server를 OpenAPI에서 생성
- 공통: 대표 happy path와 오류 fixture를 저장

## 19. 구현 전 반드시 확정할 항목

다음 항목은 현재 프론트 코드만으로 결정할 수 없다.

### 필수 제품 결정

1. 게스트 세션을 사용할지, 로그인부터 구현할지
2. 캐릭터를 한 사용자당 최대 몇 개까지 만들 수 있는지
3. 닉네임 최대 길이와 중복 허용 여부
4. 직무별 로드맵을 규칙 기반으로 생성할지 AI로 생성할지
5. 직무별 자가진단 질문과 역량 연결표
6. 퀘스트 선행 조건과 잠금 해제 규칙
7. 진행률 계산식
8. 레벨 상승 기준
9. 퀘스트 완료 시 역량 점수 변화식
10. 사용자 추가 퀘스트도 역량·레벨에 반영할지
11. AI 호출 제한, 최대 입력 길이, 사용할 provider/model
12. AI 입력·출력 저장 및 삭제 정책
13. 완료한 경험 카드 수정 가능 여부
14. MD/PDF에 포함할 개인정보와 문서 양식

### 이 문서의 기본값

별도 합의 전에는 아래를 기본값으로 사용한다.

- API path: `/api/v1`
- JSON: camelCase
- ID: UUID string
- 인증: HttpOnly guest session
- STAR 필드: 각각 최대 2000자
- 닉네임: trim 후 1~20자
- 사용자 퀘스트 제목: 1~80자
- AI API: 동기 응답, FE timeout 30초
- 경험 카드: 퀘스트 완료 당시 snapshot
- 캐릭터·퀘스트 완료: `Idempotency-Key` 지원
- 진행률·레벨·역량·잠금 상태: 서버 계산

## 20. 우선 구현 순서

### 1차: 화면 데이터 대체

1. 게스트 세션
2. catalog 조회
3. 캐릭터 목록
4. 캐릭터 생성
5. 로드맵 조회

### 2차: 핵심 사용자 기록

1. 퀘스트 상세
2. STAR 임시 저장
3. 퀘스트 완료
4. 역량·진행률 갱신
5. 경험 카드

### 3차: 부가 기능

1. AI 보완
2. 사용자 퀘스트 추가
3. MD/PDF 내보내기
4. 인증 계정 전환

## 21. 현재 mock 제거 대응표

| 현재 FE 코드 | 서버 연동 후 |
| --- | --- |
| `mythCharacters` | `GET /characters` |
| `jobCategories`, `availableJobs` | catalog API |
| `assessmentQuestions` | 직무별 assessment API |
| `initialRoadmapQuestGroups` | roadmap API |
| `customQuestsByRoadmap` | `POST /characters/{id}/quests` |
| `starRecord` 로컬 state | quest record API |
| `requestAiEnhancement` 4초 mock | AI enhancement API |
| `archiveSkillGroups` | archive API |
| `experienceEntries` | experiences API |
| `assessmentToCompetencyScores` | BE 계산 결과 |
| `MD/PDF` 표시 버튼 | archive export API |

이 대응표의 정적 데이터를 한 번에 제거하지 말고, endpoint별 feature flag 또는 mock adapter를 두어 순차적으로 교체하는 것을 권장한다.
