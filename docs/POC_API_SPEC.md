# MYiTH PoC API 명세 초안

> 상태: 초안 · API별 검증 전  
> 기준일: 2026-07-25  
> 적용 범위: 현재 `myith-frontend` UI와 서버 연동에 필요한 API만 포함

## 0. 이 문서의 전제

### 단일 공용 데모 데이터

- 로그인과 회원가입은 구현하지 않는다.
- `Authorization` 헤더, 세션 쿠키, `userId`, `clientId`를 사용하지 않는다.
- 접속한 모든 클라이언트는 서버의 **동일한 공용 데모 데이터 한 벌**을 조회하고 수정한다.
- 데이터 소유자 확인을 위한 `401`, `403` 응답은 이번 PoC 명세에 없다.
- 캐릭터 이미지와 알 이미지 파일은 프론트엔드 asset으로 관리한다. 서버는 이미지 URL 대신 `species` 코드만 반환한다.
- 서버의 데모 데이터를 초기화하는 기능은 운영자 작업으로 처리하며, 현재 UI에 없는 초기화 API는 만들지 않는다.

### API 공통 규칙

| 항목 | 규칙 |
| --- | --- |
| Base path | `/api` |
| 인증 | 없음 |
| 요청·응답 필드 | `camelCase` |
| 시간 | ISO 8601 UTC 문자열 |
| JSON 요청 | `Content-Type: application/json` |
| 식별자 | 의미를 해석하지 않는 문자열 |
| 성공 응답 | `{ "data": ... }` |
| 오류 응답 | `{ "error": { "code", "message", "fieldErrors", "requestId" } }` |
| 가변 역량 축 | 고정 객체가 아닌 `axes[]` 배열 |

### 성공 응답 예시

```json
{
  "data": {
    "roadmapId": "roadmap_demo_backend"
  }
}
```

### 오류 응답 예시

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 값을 확인해주세요.",
    "fieldErrors": {
      "nickname": "1자 이상 20자 이하로 입력해주세요."
    },
    "requestId": "req_01J4MYITH"
  }
}
```

### 공통 enum

```ts
type AssessmentLevel =
  | 'unknown'
  | 'heard'
  | 'tried'
  | 'independent'

type QuestStatus =
  | 'LOCKED'
  | 'OPEN'
  | 'DONE'
  | 'ALREADY_KNOWN'

type StarSource = 'manual' | 'ai-assisted'

type AiEnhancementStatus =
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
```

| 자가진단 화면 문구 | API 값 | 서버 내부 기준값 |
| --- | --- | --- |
| 모름 | `unknown` | `0` |
| 들어봄 | `heard` | `0.33` |
| 해봄 | `tried` | `0.66` |
| 혼자 가능 | `independent` | `1.0` |

`tried` 이상은 로드맵 생성 시 `ALREADY_KNOWN` 후보로 판정할 수 있다. 실제 판정 규칙은 해당 직무 프로필 버전에 포함된 서버 로직을 따른다.

### 서버 계산 규칙

- `completionRate = (DONE + ALREADY_KNOWN 퀘스트 수) / 전체 퀘스트 수 × 100`
- 역량별 `percent = 해당 axis의 (DONE + ALREADY_KNOWN) / 해당 axis 전체 퀘스트 × 100`
- `currentLevel`은 `OPEN`인 첫 퀘스트의 `level`이다. 모두 완료된 경우 가장 높은 레벨이다.
- `nextQuest`는 `OPEN` 중 `level`, `order`가 가장 앞선 퀘스트다.
- 캐릭터 `stage`는 퀘스트 `level`과 별개의 값이다.

| 완료율 | stage | stageLabel |
| --- | ---: | --- |
| `0 <= rate < 20` | 1 | 시작 |
| `20 <= rate < 50` | 2 | 성장 |
| `50 <= rate < 80` | 3 | 숙련 |
| `80 <= rate <= 100` | 4 | 완성 |

도달한 `stage`는 완료율이 낮아져도 내려가지 않는다.

---

## 1. API 마스터 테이블

Notion 데이터베이스의 한 행에 해당하는 목록이다. 각 API의 요청·응답은 아래 상세 페이지 섹션에서 확인한다.

| 분류 | API | HTTP method | 엔드포인트 | 명세 검증 | 백엔드 | 프론트엔드 | 연동 완료 | 설명 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| catalog | 직무 프로필 목록 조회 | GET | `/api/job-profiles` | ⬜ | Not started | Not started | ⬜ | 직무 분야 칩과 직무 카드 표시 |
| catalog | 직무·자가진단 상세 조회 | GET | `/api/job-profiles/{jobCode}` | ⬜ | Not started | Not started | ⬜ | 선택 직무와 자가진단 문항 표시 |
| character | 캐릭터 목록 조회 | GET | `/api/characters` | ⬜ | Not started | Not started | ⬜ | 신화 허브와 사이드바 표시 |
| roadmap | 로드맵 생성 | POST | `/api/roadmaps` | ⬜ | Not started | Not started | ⬜ | 온보딩 결과로 캐릭터와 로드맵 생성 |
| roadmap | 로드맵 조회 | GET | `/api/roadmaps/{roadmapId}` | ⬜ | Not started | Not started | ⬜ | 캐릭터 헤더와 레벨별 퀘스트 표시 |
| roadmap | 나만의 퀘스트 추가 | POST | `/api/roadmaps/{roadmapId}/quests` | ⬜ | Not started | Not started | ⬜ | 사용자 정의 퀘스트 생성 |
| quest | 퀘스트 상세 조회 | GET | `/api/quests/{questId}` | ⬜ | Not started | Not started | ⬜ | 퀘스트 정보와 STAR 기록 표시 |
| quest | STAR 임시 저장 | PUT | `/api/quests/{questId}/star` | ⬜ | Not started | Not started | ⬜ | 입력 중인 STAR 기록 저장 |
| quest | 퀘스트 완료 | PATCH | `/api/quests/{questId}/complete` | ⬜ | Not started | Not started | ⬜ | 완료 처리, 성장 계산, 경험 카드 생성 |
| AI | AI 보완 요청 | POST | `/api/quests/{questId}/ai-enhancements` | ⬜ | Not started | Not started | ⬜ | 비동기 AI 작업 생성 |
| AI | AI 보완 결과 조회 | GET | `/api/ai-enhancements/{requestId}` | ⬜ | Not started | Not started | ⬜ | 처리 상태와 보완 STAR 조회 |
| archive | 아카이브 대시보드 조회 | GET | `/api/roadmaps/{roadmapId}/dashboard` | ⬜ | Not started | Not started | ⬜ | 역량, 스킬 트리, 경험 카드 표시 |
| archive | 아카이브 내보내기 | GET | `/api/roadmaps/{roadmapId}/export` | ⬜ | Not started | Not started | ⬜ | MD 또는 PDF 파일 다운로드 |
| ops | 서버 상태 조회 | GET | `/api/health` | ⬜ | Not started | Not started | ⬜ | 배포·연동 상태 확인 |

---

# 2. API 상세 페이지

## 2.1 직무 프로필 목록 조회

| 속성 | 값 |
| --- | --- |
| 분류 | catalog |
| HTTP method | GET |
| 엔드포인트 | `/api/job-profiles` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

직무 선택 화면에 필요한 분야 칩과 직무 카드 목록을 한 번에 조회한다. 분야 아이콘은 프론트엔드 local asset에서 `categoryCode`로 찾는다.

### 화면 데이터 매핑

| API key | 화면 위치 | 예시 |
| --- | --- | --- |
| `categories[].categoryName` | 상단 분야 칩 | `IT·개발` |
| `jobs[].jobName` | 직무 카드 제목 | `백엔드 개발자` |
| `jobs[].description` | 직무 카드 설명 | `서버, API, DB로 서비스의 뼈대를 만든다` |
| `jobs[].skillTags[]` | 직무 카드 기술 태그 | `Java`, `Spring` |
| `jobs[].enabled` | 선택 가능 여부 | `true` |

### 요청

요청 본문 없음.

### 성공 응답 `200 OK`

```json
{
  "data": {
    "profileVersion": 1,
    "categories": [
      {
        "categoryCode": "it-development",
        "categoryName": "IT·개발",
        "sortOrder": 1
      },
      {
        "categoryCode": "marketing",
        "categoryName": "마케팅",
        "sortOrder": 2
      }
    ],
    "jobs": [
      {
        "jobCode": "backend-developer",
        "categoryCode": "it-development",
        "jobName": "백엔드 개발자",
        "description": "서버, API, DB로 서비스의 뼈대를 만든다",
        "skillTags": ["Java", "Spring", "Database"],
        "enabled": true,
        "sortOrder": 1
      }
    ]
  }
}
```

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 500 | `INTERNAL_SERVER_ERROR` | 직무 프로필 조회 실패 |

---

## 2.2 직무·자가진단 상세 조회

| 속성 | 값 |
| --- | --- |
| 분류 | catalog |
| HTTP method | GET |
| 엔드포인트 | `/api/job-profiles/{jobCode}` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

선택한 직무의 설명, 가변 역량 축, 자가진단 문항과 답변 단계를 조회한다.

### 화면 데이터 매핑

| API key | 화면 위치 | 예시 |
| --- | --- | --- |
| `jobName` | 닉네임·자가진단 화면 직무명 | `백엔드 개발자` |
| `questions[].prompt` | 자가진단 질문 한 행 | `REST API를 설계해본 적이 있나요?` |
| `questions[].axisName` | 질문의 역량 분류 | `서버·API` |
| `answerLevels[].label` | 답변 버튼 | `해봄` |
| `profileVersion` | 로드맵 생성 요청에 재전송 | `1` |

### 요청

| 위치 | key | 필수 | 설명 |
| --- | --- | --- | --- |
| path | `jobCode` | O | 직무 코드 |

### 성공 응답 `200 OK`

```json
{
  "data": {
    "jobCode": "backend-developer",
    "jobName": "백엔드 개발자",
    "description": "서버, API, DB로 서비스의 뼈대를 만든다",
    "profileVersion": 1,
    "axes": [
      {
        "axisCode": "server-api",
        "axisName": "서버·API",
        "sortOrder": 1
      },
      {
        "axisCode": "database",
        "axisName": "데이터베이스",
        "sortOrder": 2
      }
    ],
    "questions": [
      {
        "skillCode": "rest-api",
        "axisCode": "server-api",
        "axisName": "서버·API",
        "prompt": "REST API를 설계해본 적이 있나요?",
        "sortOrder": 1
      }
    ],
    "answerLevels": [
      { "value": "unknown", "label": "모름", "sortOrder": 1 },
      { "value": "heard", "label": "들어봄", "sortOrder": 2 },
      { "value": "tried", "label": "해봄", "sortOrder": 3 },
      { "value": "independent", "label": "혼자 가능", "sortOrder": 4 }
    ]
  }
}
```

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 404 | `JOB_PROFILE_NOT_FOUND` | 존재하지 않거나 비활성화된 직무 |

---

## 2.3 캐릭터 목록 조회

| 속성 | 값 |
| --- | --- |
| 분류 | character |
| HTTP method | GET |
| 엔드포인트 | `/api/characters` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

신화 허브의 캐릭터 카드와 왼쪽 사이드바를 구성한다. 온보딩의 알 후보는 이 응답의 `species`를 제외한 local asset 중 프론트가 무작위로 선택한다.

### 화면 데이터 매핑

| API key | 화면 위치 | 예시 |
| --- | --- | --- |
| `characters[].nickname` | 캐릭터 카드 제목·사이드바 첫 줄 | `견습 서버 개발자` |
| `characters[].jobName` | 캐릭터 카드 설명·사이드바 둘째 줄 | `백엔드 개발자` |
| `characters[].species` + `stage` | 캐릭터 이미지 파일 선택 | `deokbaseu-3.png` |
| `characters[].currentLevel` | `Lv.4` 뱃지 | `4` |
| `characters[].stageLabel` | 캐릭터 성장 단계 | `숙련` |
| `characters[].completionRate` | 진행률 숫자와 막대 | `80` |
| `characters[].nextQuest.title` | 허브의 `다음 퀘스트` | `REST API 구조 이해하기` |

### 요청

요청 본문 없음.

### 성공 응답 `200 OK`

```json
{
  "data": {
    "characters": [
      {
        "characterId": "character_demo_backend",
        "roadmapId": "roadmap_demo_backend",
        "nickname": "견습 서버 개발자",
        "jobCode": "backend-developer",
        "jobName": "백엔드 개발자",
        "description": "서버, API, DB로 서비스의 뼈대를 만든다",
        "species": "deokbaseu",
        "currentLevel": 4,
        "stage": 3,
        "stageLabel": "숙련",
        "completionRate": 80,
        "completedQuestCount": 8,
        "nextQuest": {
          "questId": "quest_rest_structure",
          "title": "REST API 구조 이해하기"
        }
      }
    ]
  }
}
```

`nextQuest`가 없으면 `null`을 반환한다.

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 500 | `INTERNAL_SERVER_ERROR` | 공용 캐릭터 데이터 조회 실패 |

---

## 2.4 로드맵 생성

| 속성 | 값 |
| --- | --- |
| 분류 | roadmap |
| HTTP method | POST |
| 엔드포인트 | `/api/roadmaps` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

알 선택, 직무 선택, 닉네임, 자가진단 결과로 캐릭터와 로드맵을 하나의 트랜잭션에서 생성한다. 선택형 데이터만 사용하므로 PoC에서는 동기 생성한다.

### 화면 데이터 매핑

| 요청 key | 화면에서 가져오는 값 | 예시 |
| --- | --- | --- |
| `species` | 알 선택 화면에서 고른 캐릭터 코드 | `deokbaseu` |
| `jobCode` | 선택한 직무 카드 | `backend-developer` |
| `nickname` | 캐릭터 이름 입력값 | `견습 서버 개발자` |
| `answers[].skillCode` | 자가진단 문항 식별자 | `rest-api` |
| `answers[].level` | 선택한 답변 버튼 | `tried` |

### 요청

| 위치 | key | 필수 | 검증 |
| --- | --- | --- | --- |
| header | `Idempotency-Key` | 권장 | 중복 클릭 시 같은 생성 결과 반환 |
| body | `jobCode` | O | 활성 직무 |
| body | `profileVersion` | O | 조회한 직무 프로필 버전 |
| body | `species` | O | 프론트 local catalog에 있는 코드 |
| body | `nickname` | O | trim 후 1~20자 |
| body | `answers` | O | 해당 프로필의 모든 필수 문항 |

```json
{
  "jobCode": "backend-developer",
  "profileVersion": 1,
  "species": "deokbaseu",
  "nickname": "견습 서버 개발자",
  "answers": [
    {
      "skillCode": "rest-api",
      "level": "tried"
    },
    {
      "skillCode": "database-basic",
      "level": "heard"
    }
  ]
}
```

### 성공 응답 `201 Created`

```json
{
  "data": {
    "roadmapId": "roadmap_demo_backend",
    "character": {
      "characterId": "character_demo_backend",
      "roadmapId": "roadmap_demo_backend",
      "nickname": "견습 서버 개발자",
      "jobCode": "backend-developer",
      "jobName": "백엔드 개발자",
      "species": "deokbaseu",
      "currentLevel": 1,
      "stage": 1,
      "stageLabel": "시작",
      "completionRate": 15
    }
  }
}
```

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | 닉네임, species, 답변 형식 오류 |
| 409 | `PROFILE_VERSION_MISMATCH` | 직무 프로필이 갱신됨 |
| 422 | `ASSESSMENT_INCOMPLETE` | 필수 자가진단 답변 누락 |

---

## 2.5 로드맵 조회

| 속성 | 값 |
| --- | --- |
| 분류 | roadmap |
| HTTP method | GET |
| 엔드포인트 | `/api/roadmaps/{roadmapId}` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

로드맵 상단 캐릭터 정보와 레벨별 퀘스트 카드를 조회한다. `Lv.N` 구분선에는 캐릭터 `stageLabel`을 붙이지 않는다.

### 화면 데이터 매핑

| API key | 화면 위치 |
| --- | --- |
| `character.nickname` | 상단 캐릭터 이름 |
| `character.description` | 이름 옆 직무 설명 |
| `character.species`, `character.stage` | 289px 캐릭터 이미지 |
| `character.completionRate` | 신화 진행률 막대 |
| `levels[].level` | `Lv.1`, `Lv.2` 구분선 |
| `levels[].quests[].axisName` | 퀘스트 카드의 작은 분류명 |
| `levels[].quests[].title` | 퀘스트 카드 제목 |
| `levels[].quests[].status` | 완료·진행·열림·잠금·이미 보유 스타일 |

### 요청

| 위치 | key | 필수 | 설명 |
| --- | --- | --- | --- |
| path | `roadmapId` | O | 캐릭터 목록에서 받은 로드맵 ID |

### 성공 응답 `200 OK`

```json
{
  "data": {
    "roadmapId": "roadmap_demo_backend",
    "character": {
      "characterId": "character_demo_backend",
      "nickname": "견습 서버 개발자",
      "jobCode": "backend-developer",
      "jobName": "백엔드 개발자",
      "description": "서버, API, DB로 서비스의 뼈대를 만든다",
      "species": "deokbaseu",
      "currentLevel": 4,
      "stage": 3,
      "stageLabel": "숙련",
      "completionRate": 80
    },
    "axes": [
      {
        "axisCode": "server-api",
        "axisName": "서버·API"
      }
    ],
    "levels": [
      {
        "level": 1,
        "quests": [
          {
            "questId": "quest_programming_basic",
            "level": 1,
            "axisCode": "programming",
            "axisName": "프로그래밍 기초",
            "title": "개발환경을 구축할 수 있다",
            "status": "DONE",
            "isCustom": false,
            "order": 1
          }
        ]
      },
      {
        "level": 5,
        "quests": [
          {
            "questId": "quest_cs_interview",
            "level": 5,
            "axisCode": "computer-science",
            "axisName": "CS·자료구조",
            "title": "CS 면접 질문을 정리한다",
            "status": "LOCKED",
            "isCustom": false,
            "order": 1
          }
        ]
      }
    ]
  }
}
```

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 404 | `ROADMAP_NOT_FOUND` | 존재하지 않는 로드맵 |

---

## 2.6 나만의 퀘스트 추가

| 속성 | 값 |
| --- | --- |
| 분류 | roadmap |
| HTTP method | POST |
| 엔드포인트 | `/api/roadmaps/{roadmapId}/quests` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

로드맵 화면의 `퀘스트 추가` 폼에서 제목, 역량 분류, 레벨을 받아 사용자 정의 퀘스트를 생성한다.

### 화면 데이터 매핑

| 요청 key | 화면 입력 |
| --- | --- |
| `title` | `퀘스트 제목` 입력란 |
| `axisCode` | `역량 분류` 선택 |
| `level` | `레벨` 선택 |

### 요청

```json
{
  "title": "사이드 프로젝트를 운영한다",
  "axisCode": "deployment",
  "level": 4
}
```

| key | 필수 | 검증 |
| --- | --- | --- |
| `title` | O | trim 후 1~100자 |
| `axisCode` | O | 현재 로드맵 직무의 axes 중 하나 |
| `level` | O | 현재 로드맵에 허용된 레벨 |

### 성공 응답 `201 Created`

```json
{
  "data": {
    "questId": "quest_custom_01J4",
    "level": 4,
    "axisCode": "deployment",
    "axisName": "배포·운영",
    "title": "사이드 프로젝트를 운영한다",
    "status": "OPEN",
    "isCustom": true,
    "order": 3
  }
}
```

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | 제목·레벨 형식 오류 |
| 404 | `ROADMAP_NOT_FOUND` | 존재하지 않는 로드맵 |
| 422 | `AXIS_NOT_IN_JOB_PROFILE` | 직무에 없는 역량 축 |

---

## 2.7 퀘스트 상세 조회

| 속성 | 값 |
| --- | --- |
| 분류 | quest |
| HTTP method | GET |
| 엔드포인트 | `/api/quests/{questId}` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

퀘스트 카드 또는 허브의 `다음 퀘스트`를 클릭했을 때 퀘스트 상세 화면을 구성한다.

### 화면 데이터 매핑

| API key | 화면 위치 |
| --- | --- |
| `level` | 상단 `Lv.N` 뱃지 |
| `axisName` | 퀘스트 분류 |
| `title` | 퀘스트 제목 |
| `completionCriteria` | 완료 기준 |
| `ncsReferences[]` | NCS 참고 정보 |
| `recommendedCertificates[]` | 추천 자격증 |
| `star.situation` | S textarea |
| `star.task` | T textarea |
| `star.action` | A textarea |
| `star.result` | R textarea |
| `status` | 잠금 여부와 완료 버튼 상태 |

### 요청

| 위치 | key | 필수 |
| --- | --- | --- |
| path | `questId` | O |

### 성공 응답 `200 OK`

```json
{
  "data": {
    "questId": "quest_cs_interview",
    "roadmapId": "roadmap_demo_backend",
    "version": 3,
    "level": 5,
    "axisCode": "computer-science",
    "axisName": "CS·자료구조",
    "title": "CS 면접 질문을 정리한다",
    "status": "OPEN",
    "completionCriteria": "네트워크·운영체제·데이터베이스 질문과 답변을 정리한다.",
    "ncsReferences": [
      {
        "code": "20010202",
        "name": "응용SW엔지니어링"
      }
    ],
    "recommendedCertificates": [
      {
        "name": "정보처리기사"
      }
    ],
    "star": {
      "situation": "",
      "task": "",
      "action": "",
      "result": ""
    },
    "starSource": "manual",
    "aiEnhancementId": null,
    "updatedAt": "2026-07-25T01:00:00Z"
  }
}
```

잠긴 퀘스트도 상세 조회는 허용하지만 STAR 저장과 완료는 허용하지 않는다.

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 404 | `QUEST_NOT_FOUND` | 존재하지 않는 퀘스트 |

---

## 2.8 STAR 임시 저장

| 속성 | 값 |
| --- | --- |
| 분류 | quest |
| HTTP method | PUT |
| 엔드포인트 | `/api/quests/{questId}/star` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

명시적인 저장 버튼이 없으므로 textarea 변경 후 500~1000ms debounce 또는 blur 시 호출한다. 일부 STAR 칸이 비어 있어도 저장할 수 있다.

### 화면 데이터 매핑

| 요청 key | 화면 입력 |
| --- | --- |
| `star.situation` | S 상황 |
| `star.task` | T 과제 |
| `star.action` | A 행동 |
| `star.result` | R 결과 |
| `source` | 직접 입력은 `manual`, AI 적용 후는 `ai-assisted` |

### 요청

```json
{
  "star": {
    "situation": "CS 면접 준비를 시작했지만 개념을 구조적으로 설명하기 어려웠다.",
    "task": "자주 나오는 질문을 주제별로 정리하기로 했다.",
    "action": "",
    "result": ""
  },
  "source": "manual",
  "aiEnhancementId": null
}
```

| key | 필수 | 검증 |
| --- | --- | --- |
| `star.*` | O | 각 항목 trim 후 0~2000자 |
| `source` | O | `manual` 또는 `ai-assisted` |
| `aiEnhancementId` | 조건부 | `ai-assisted`일 때 필수 |

### 성공 응답 `200 OK`

```json
{
  "data": {
    "questId": "quest_cs_interview",
    "star": {
      "situation": "CS 면접 준비를 시작했지만 개념을 구조적으로 설명하기 어려웠다.",
      "task": "자주 나오는 질문을 주제별로 정리하기로 했다.",
      "action": "",
      "result": ""
    },
    "starSource": "manual",
    "aiEnhancementId": null,
    "status": "OPEN",
    "updatedAt": "2026-07-25T01:10:00Z"
  }
}
```

STAR를 저장해도 퀘스트 상태는 `OPEN`으로 유지한다.

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | 길이·source 형식 오류 |
| 409 | `QUEST_LOCKED` | 잠긴 퀘스트 수정 시도 |

---

## 2.9 퀘스트 완료

| 속성 | 값 |
| --- | --- |
| 분류 | quest |
| HTTP method | PATCH |
| 엔드포인트 | `/api/quests/{questId}/complete` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

STAR 최종본 저장, 퀘스트 완료, 경험 카드 snapshot 생성, 역량·진행률·stage 재계산, 다음 퀘스트 잠금 해제를 한 트랜잭션으로 처리한다.

### 화면 데이터 매핑

| 응답 key | 반영 화면 |
| --- | --- |
| `quest.status` | 현재 퀘스트 카드 완료 스타일 |
| `characterChanges.completionRate` | 허브·로드맵 진행률 |
| `characterChanges.stage` | 캐릭터 이미지 단계 |
| `characterChanges.axes[]` | 아카이브 역량 다각형 |
| `characterChanges.nextQuest` | 허브 다음 퀘스트 |
| `unlockedQuestIds[]` | 새로 열린 로드맵 카드 |
| `experienceId` | 아카이브 경험 카드 |

### 요청

| 위치 | key | 필수 | 설명 |
| --- | --- | --- | --- |
| header | `Idempotency-Key` | 권장 | 완료 버튼 중복 클릭 방지 |
| body | `completed` | O | 완료 처리 여부 |
| body | `star` | 선택 | 네 필드를 전달하면 STAR 저장과 완료를 한 번에 처리 |

```json
{
  "completed": true,
  "star": {
    "situation": "CS 면접 준비 과정에서 핵심 개념을 설명하기 어려웠다.",
    "task": "질문을 주제별로 선별하고 답변을 정리하기로 했다.",
    "action": "정의·원리·활용 사례 순서로 답변을 작성하고 반복해서 설명했다.",
    "result": "핵심 개념을 짧고 논리적으로 설명할 수 있게 되었다."
  }
}
```

### 성공 응답 `200 OK`

```json
{
  "data": {
    "quest": {
      "questId": "quest_cs_interview",
      "version": 5,
      "status": "DONE",
      "completedAt": "2026-07-25T01:20:00Z"
    },
    "characterChanges": {
      "currentLevel": 5,
      "stage": 4,
      "stageLabel": "완성",
      "completionRate": 84,
      "completedQuestCount": 9,
      "axes": [
        {
          "axisCode": "computer-science",
          "axisName": "CS·자료구조",
          "percent": 80
        }
      ],
      "nextQuest": {
        "questId": "quest_collaboration",
        "title": "협업 프로젝트로 실전을 쌓는다"
      }
    },
    "unlockedQuestIds": ["quest_collaboration"],
    "experienceId": "experience_01J4"
  }
}
```

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 400 | `STAR_INCOMPLETE` | 네 STAR 항목 중 빈 값 존재 |
| 409 | `QUEST_LOCKED` | 잠긴 퀘스트 완료 시도 |
| 422 | `AI_ENHANCEMENT_NOT_FOUND` | 유효하지 않은 AI 결과 ID |

---

## 2.10 AI 보완 요청

| 속성 | 값 |
| --- | --- |
| 분류 | AI |
| HTTP method | POST |
| 엔드포인트 | `/api/quests/{questId}/ai-enhancements` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

퀘스트 상세 화면의 `AI로 강화하기` 클릭 시 비동기 작업을 생성한다. 서버가 응답을 인위적으로 4초 지연하지 않는다. 모달의 최소 애니메이션 노출 시간은 프론트엔드가 제어한다.

### 화면 데이터 매핑

| 요청 key | 화면 데이터 |
| --- | --- |
| `star.*` | 모달 왼쪽 `직접 쓴 글` 네 행 |
| `locale` | 한국어 UI는 `ko-KR` |
| `style` | 현재 보완 문체 |

### 요청

```json
{
  "star": {
    "situation": "CS 면접 준비를 하고 있다.",
    "task": "질문을 정리한다.",
    "action": "답변을 작성했다.",
    "result": "공부가 되었다."
  },
  "locale": "ko-KR",
  "style": "concise-professional"
}
```

네 STAR 항목은 각각 trim 후 1~2000자여야 한다.

### 성공 응답 `202 Accepted`

```json
{
  "data": {
    "requestId": "ai_request_01J4",
    "status": "PROCESSING",
    "pollAfterMs": 800
  }
}
```

프론트는 `pollAfterMs` 이후 결과 조회 API를 호출한다.

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 400 | `STAR_INCOMPLETE` | 빈 STAR 항목 존재 |
| 409 | `QUEST_LOCKED` | 잠긴 퀘스트 |
| 413 | `AI_INPUT_TOO_LONG` | 허용 길이 초과 |
| 429 | `AI_RATE_LIMITED` | AI 호출 제한 |
| 503 | `AI_PROVIDER_UNAVAILABLE` | AI 작업 생성 불가 |

---

## 2.11 AI 보완 결과 조회

| 속성 | 값 |
| --- | --- |
| 분류 | AI |
| HTTP method | GET |
| 엔드포인트 | `/api/ai-enhancements/{requestId}` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

AI 요청의 처리 상태를 폴링한다. `PROCESSING` 중에는 shimmer 또는 파티클 로딩을 유지하고, 종료 상태(`COMPLETED` 또는 `FAILED`)에서는 오른쪽 결과 카드에 `enhancedStar`를 표시한다.

### 화면 데이터 매핑

| API key | 모달 표시 |
| --- | --- |
| `status=PROCESSING` | 생성 중 애니메이션 |
| `enhancedStar.*` | `AI로 보완한 글` S/T/A/R |
| `status=FAILED` | `enhancedStar.situation` 오류 안내, 적용 버튼 비활성화 |
| `requestId` | 적용 후 STAR 저장 요청에 포함 |

### 요청

| 위치 | key | 필수 |
| --- | --- | --- |
| path | `requestId` | O |

### 처리 중 응답 `200 OK`

```json
{
  "data": {
    "requestId": "ai_request_01J4",
    "status": "PROCESSING",
  }
}
```

### 완료 응답 `200 OK`

```json
{
  "data": {
    "requestId": "ai_request_01J4",
    "status": "COMPLETED",
    "questId": "quest_cs_interview",
    "enhancedStar": {
      "situation": "CS 면접 준비 과정에서 네트워크·운영체제·데이터베이스 개념을 공부했지만 핵심을 구조적으로 설명하는 데 어려움을 느꼈다.",
      "task": "자주 출제되는 질문을 주제별로 선별하고 실제 사례를 포함한 답변을 정리하기로 했다.",
      "action": "영역별 질문을 수집하고 답변을 정의·원리·활용 사례 순서로 작성한 뒤 반복해서 설명했다.",
      "result": "핵심 개념을 짧고 논리적으로 설명하고 부족한 영역을 반복 학습할 수 있는 답변 자료를 완성했다."
    },
    "createdAt": "2026-07-25T01:25:00Z"
  }
}
```

### 실패 응답 `200 OK`

비동기 작업 자체의 실패는 조회 요청 실패와 구분하기 위해 `200` 응답 안에서 표현한다.

```json
{
  "data": {
    "requestId": "ai_request_01J4",
    "status": "FAILED",
    "enhancedStar": {
      "situation": "AI 보완에 실패했습니다. 잠시 후 다시 시도해주세요.",
      "task": "",
      "action": "",
      "result": ""
    },
    "feedback": [],
    "errorCode": "AI_PROVIDER_TIMEOUT"
  }
}
```

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 404 | `AI_REQUEST_NOT_FOUND` | 존재하지 않는 요청 ID |
| 503 | `AI_STATUS_UNAVAILABLE` | 작업 상태 저장소 조회 실패 |

---

## 2.12 아카이브 대시보드 조회

| 속성 | 값 |
| --- | --- |
| 분류 | archive |
| HTTP method | GET |
| 엔드포인트 | `/api/roadmaps/{roadmapId}/dashboard` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

아카이브 한 화면에 필요한 캐릭터 요약, 가변 역량 축, 스킬 트리, 경험 카드를 한 번에 조회한다.

### 화면 데이터 매핑

| API key | 화면 위치 |
| --- | --- |
| `character.nickname` | 아카이브 제목 |
| `character.jobName` | 제목 아래 직무 |
| `character.currentLevel` | `Lv.N` |
| `character.completedQuestCount` | `완료 N개` |
| `character.completionRate` | `진행률 N%` |
| `axes[]` | 역량 다각형 축·퍼센트 |
| `skillTree[].quests[]` | 레벨별 스킬 트리 카드 |
| `experiences[]` | 경험 카드 |
| `experiences[].star` | 경험 카드의 S/T/A/R 본문 |

### 요청

| 위치 | key | 필수 |
| --- | --- | --- |
| path | `roadmapId` | O |

### 성공 응답 `200 OK`

```json
{
  "data": {
    "roadmapId": "roadmap_demo_backend",
    "character": {
      "characterId": "character_demo_backend",
      "nickname": "견습 서버 개발자",
      "jobCode": "backend-developer",
      "jobName": "백엔드 개발자",
      "species": "deokbaseu",
      "currentLevel": 4,
      "stage": 3,
      "stageLabel": "숙련",
      "completionRate": 80,
      "completedQuestCount": 8
    },
    "axes": [
      {
        "axisCode": "programming",
        "axisName": "프로그래밍 기초",
        "percent": 72
      },
      {
        "axisCode": "server-api",
        "axisName": "서버·API",
        "percent": 67
      }
    ],
    "skillTree": [
      {
        "level": 1,
        "quests": [
          {
            "questId": "quest_programming_basic",
            "axisCode": "programming",
            "axisName": "프로그래밍 기초",
            "title": "개발환경을 구축할 수 있다",
            "status": "DONE"
          }
        ]
      }
    ],
    "experiences": [
      {
        "experienceId": "experience_01J4",
        "questId": "quest_programming_basic",
        "questTitle": "개발환경을 구축할 수 있다",
        "axisCode": "programming",
        "axisName": "프로그래밍 기초",
        "star": {
          "situation": "새 프로젝트를 시작했지만 개발 환경이 통일되지 않았다.",
          "task": "누구나 같은 환경에서 실행할 수 있도록 구성하기로 했다.",
          "action": "설치 순서와 환경 변수를 문서화하고 실행을 검증했다.",
          "result": "팀원이 같은 환경에서 프로젝트를 실행할 수 있게 되었다."
        },
        "source": "manual",
        "completedAt": "2026-07-24T04:30:00Z"
      }
    ]
  }
}
```

경험이 없으면 `experiences: []`를 반환하며, 프론트는 `아직 기록된 경험이 없어요`를 표시한다.

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 404 | `ROADMAP_NOT_FOUND` | 존재하지 않는 로드맵 |

---

## 2.13 아카이브 내보내기

| 속성 | 값 |
| --- | --- |
| 분류 | archive |
| HTTP method | GET |
| 엔드포인트 | `/api/roadmaps/{roadmapId}/export` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

아카이브의 `MD 내보내기`, `PDF 내보내기` 버튼에서 파일을 다운로드한다.

### 화면 데이터 매핑

| 화면 버튼 | 요청 |
| --- | --- |
| MD 내보내기 | `?format=md` |
| PDF 내보내기 | `?format=pdf` |

### 요청

| 위치 | key | 필수 | 허용 값 |
| --- | --- | --- | --- |
| path | `roadmapId` | O | 로드맵 ID |
| query | `format` | O | `md`, `pdf` |

```http
GET /api/roadmaps/roadmap_demo_backend/export?format=pdf
```

### 성공 응답 `200 OK`

JSON이 아닌 파일 응답이다.

| format | Content-Type | 파일명 예시 |
| --- | --- | --- |
| `md` | `text/markdown; charset=utf-8` | `myith-견습-서버-개발자.md` |
| `pdf` | `application/pdf` | `myith-견습-서버-개발자.pdf` |

```http
Content-Disposition: attachment; filename*=UTF-8''myith-%EA%B2%AC%EC%8A%B5-%EC%84%9C%EB%B2%84-%EA%B0%9C%EB%B0%9C%EC%9E%90.pdf
```

내보내기 내용에는 캐릭터 요약, 역량, 완료 퀘스트, 경험 카드 STAR snapshot을 포함한다.

### Error Responses

| HTTP | code | 상황 |
| --- | --- | --- |
| 400 | `UNSUPPORTED_EXPORT_FORMAT` | `md`, `pdf` 외 형식 |
| 404 | `ROADMAP_NOT_FOUND` | 존재하지 않는 로드맵 |
| 500 | `EXPORT_GENERATION_FAILED` | 파일 생성 실패 |

---

## 2.14 서버 상태 조회

| 속성 | 값 |
| --- | --- |
| 분류 | ops |
| HTTP method | GET |
| 엔드포인트 | `/api/health` |
| 명세 검증 | ⬜ |
| 백엔드 | Not started |
| 프론트엔드 | Not started |
| 연동 완료 | ⬜ |

### 설명

배포 환경에서 프론트엔드가 연결할 API 서버가 정상인지 확인한다. 사용자 화면의 필수 호출은 아니며 연동·운영 점검에 사용한다.

### 요청

요청 본문 없음.

### 성공 응답 `200 OK`

```json
{
  "data": {
    "status": "UP",
    "timestamp": "2026-07-25T01:30:00Z"
  }
}
```

### Error Responses

서버가 정상 응답할 수 없는 경우 인프라 수준의 `5xx` 또는 연결 실패로 판단한다.

---

# 3. 화면별 API 호출 순서

## 앱 진입·신화 허브

1. `GET /api/characters`
2. 캐릭터가 없으면 빈 허브 표시
3. 캐릭터 카드의 `다음 퀘스트` 클릭 시 `GET /api/quests/{questId}`
4. `로드맵` 클릭 시 `GET /api/roadmaps/{roadmapId}`
5. `아카이브` 클릭 시 `GET /api/roadmaps/{roadmapId}/dashboard`

## 새 캐릭터 만들기

1. `GET /api/characters`의 보유 `species`를 local 22종에서 제외하고 알 후보 3개 선택
2. `GET /api/job-profiles`
3. 직무 선택 후 `GET /api/job-profiles/{jobCode}`
4. 닉네임과 자가진단 입력
5. `POST /api/roadmaps`
6. 응답의 `roadmapId`로 `GET /api/roadmaps/{roadmapId}`

## 퀘스트 기록과 완료

1. `GET /api/quests/{questId}`
2. 입력 중 `PUT /api/quests/{questId}/star`
3. AI 사용 시:
   - `POST /api/quests/{questId}/ai-enhancements`
   - `GET /api/ai-enhancements/{requestId}` 폴링
   - 사용자가 적용하면 textarea만 교체
   - 다음 임시 저장 또는 완료 요청에 `source=ai-assisted`, `aiEnhancementId` 포함
4. 네 칸이 채워지면 `PATCH /api/quests/{questId}/complete`
5. 완료 응답으로 허브·로드맵 캐시 갱신

## 아카이브

1. `GET /api/roadmaps/{roadmapId}/dashboard`
2. MD 버튼: `GET /api/roadmaps/{roadmapId}/export?format=md`
3. PDF 버튼: `GET /api/roadmaps/{roadmapId}/export?format=pdf`

---

# 4. 프론트엔드 local asset 책임

서버가 아래 파일을 전달하지 않는다.

| 데이터 | 서버 응답 | 프론트 처리 |
| --- | --- | --- |
| 캐릭터 이미지 | `species`, `stage` | `${species}-${stage}.png` local asset 선택 |
| 알 이미지 | `species` | local egg asset 선택 |
| 분야 아이콘 | `categoryCode` | 코드에 매핑된 local SVG 선택 |
| 카드 상태 아이콘 | `QuestStatus` | 상태별 local SVG 선택 |

프론트엔드는 서버에서 받은 문자열을 그대로 파일 경로로 연결하지 않고, 허용된 catalog map을 통해 안전하게 asset을 선택한다.

## 현재 프론트엔드에서 필요한 변환

현재 mock 타입과 확정 API 타입의 이름이 다르므로 연동 시 아래 변환이 필요하다.

| 서버 값 | 현재 프론트 값·처리 |
| --- | --- |
| `DONE` | `complete` 카드 스타일 |
| `OPEN` | `open` 카드 스타일 |
| `LOCKED` | `locked` 카드 스타일 |
| `ALREADY_KNOWN` | `OPEN`과 같은 수행 가능 카드 스타일 |
| `axes[]` | 현재 고정 6축 `CompetencyScores`를 가변 배열 레이더로 변경 |
| `stageLabel: 시작/성장/숙련/완성` | 기존 입문·견습·전설 문구를 서버 값으로 표시 |
| `completionRate` | 현재 mock의 `progress`를 대체 |
| `axisCode`, `axisName` | 현재 mock의 `category`를 대체 |

---

# 5. 이번 PoC에서 제외한 API

| 제외 항목 | 이유 |
| --- | --- |
| 로그인·로그아웃·회원가입·토큰 갱신 | 로그인 기능을 구현하지 않음 |
| 사용자 프로필·회원 탈퇴 | 공용 단일 데모 데이터 |
| 알 catalog API | 22종 목록과 이미지가 프론트 local asset에 있음 |
| 포트폴리오 파일 업로드·Presigned URL | 현재 UI에 업로드 화면이 없음 |
| 서술형 온보딩·GitHub 저장소 분석 | 현재 UI에 입력 단계가 없음 |
| 로드맵 생성 SSE | 선택형 입력만 사용해 동기 생성 |
| Electron heartbeat | 웹 UI 연동 범위 밖 |
| 퀘스트 순서 변경 | 안내 문구만 있고 현재 조작 UI가 없음 |
| 캐릭터·퀘스트 삭제 | 현재 UI에 삭제 동작이 없음 |
| 데모 데이터 초기화 | 운영자 수동 작업으로 처리 |

---

# 6. API별 검증 체크리스트

다음 회의부터 아래 순서로 한 API씩 확정한다.

| 순서 | API | 엔드포인트 | 화면 key 매핑 | 요청 검증 | 응답 검증 | 오류 검증 | 최종 합의 |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | 직무 프로필 목록 조회 | `GET /api/job-profiles` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 2 | 직무·자가진단 상세 조회 | `GET /api/job-profiles/{jobCode}` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 3 | 캐릭터 목록 조회 | `GET /api/characters` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 4 | 로드맵 생성 | `POST /api/roadmaps` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 5 | 로드맵 조회 | `GET /api/roadmaps/{roadmapId}` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 6 | 나만의 퀘스트 추가 | `POST /api/roadmaps/{roadmapId}/quests` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 7 | 퀘스트 상세 조회 | `GET /api/quests/{questId}` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 8 | STAR 임시 저장 | `PUT /api/quests/{questId}/star` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 9 | 퀘스트 완료 | `PATCH /api/quests/{questId}/complete` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 10 | AI 보완 요청 | `POST /api/quests/{questId}/ai-enhancements` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 11 | AI 보완 결과 조회 | `GET /api/ai-enhancements/{requestId}` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 12 | 아카이브 대시보드 조회 | `GET /api/roadmaps/{roadmapId}/dashboard` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 13 | 아카이브 내보내기 | `GET /api/roadmaps/{roadmapId}/export` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 14 | 서버 상태 조회 | `GET /api/health` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

각 API 검증 시 아래 질문에 답한 뒤 `명세 검증`을 체크한다.

1. 이 API가 현재 화면의 어떤 사용자 동작에서 호출되는가?
2. 요청 key는 화면의 어떤 입력값인가?
3. 응답 key는 화면의 어느 텍스트·이미지·카드에 표시되는가?
4. 빈 배열, `null`, 잠금, AI 실패를 화면이 처리할 수 있는가?
5. 백엔드가 실제로 계산할 값과 프론트가 표현만 할 값이 분리되어 있는가?
6. BE OpenAPI 예시와 이 문서의 JSON 예시가 같은가?

---

# 7. Notion 데이터베이스로 옮기는 방법

## 데이터베이스 속성

| 속성명 | Notion 타입 |
| --- | --- |
| 분류 | Select |
| API | Title |
| HTTP method | Select |
| 엔드포인트 | Text |
| 명세 검증 | Checkbox |
| 백엔드 | Status |
| 프론트엔드 | Status |
| 연동 완료 | Checkbox |
| 설명 | Text |

## 각 행의 상세 페이지 본문

이 문서의 `2.1`~`2.14`를 각각 해당 API 행의 페이지 본문으로 복사한다.

1. 설명
2. 화면 데이터 매핑
3. 요청
4. 성공 응답
5. Error Responses

GET 또는 DELETE처럼 요청 본문이 없는 API도 `요청 본문 없음`을 명시한다. 프론트엔드가 key를 바로 이해할 수 있도록 `화면 데이터 매핑`은 삭제하지 않는다.

---

# 8. 작성 근거

- 현재 프론트엔드 컴포넌트와 mock data
  - `src/App.tsx`
  - `src/components/RoadmapPage.tsx`
  - `src/components/QuestDetailPage.tsx`
  - `src/components/AIAssistModal.tsx`
  - `src/components/ArchivePage.tsx`
  - `src/data/home.ts`
  - `src/data/onboarding.ts`
  - `src/data/roadmap.ts`
  - `src/data/archive.ts`
- 기존 프론트 초안: `docs/BACKEND_API_SPEC.md`
- 백엔드 정정 명세 팀 전달본: 2026-07-25
- DOMISA Notion API 명세: **문서의 마스터 테이블·상세 페이지 형식만 참고**, 도메인과 API 내용은 사용하지 않음
