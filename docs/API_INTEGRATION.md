# MYiTH API 연동 가이드

## 기준 문서

- UX 기준: Figma `👹 소프트웨어 공모전`의 WEB 화면
- 백엔드 원본: `https://api.myith.store/v3/api-docs`
- 프론트 타입용 보강 계약: `openapi/myith-api.yaml`
- 생성 타입: `src/api/openapi.generated.ts`
- 목 서버 fixture와 동작: `src/api/mockBackend.ts`

OpenAPI를 수정한 뒤에는 `npm run api:types`를 실행해 타입을 다시 생성한다. 생성 파일은
직접 수정하지 않는다. 백엔드 Swagger는 현재 성공 응답을 `example`로만 제공하고
`schema`를 제공하지 않으므로, 프론트 계약에는 같은 예시 구조의 응답 스키마를 보강해
타입을 생성한다. 요청 body와 경로는 백엔드 Swagger를 우선한다.

## 환경변수

| 변수 | 용도 |
| --- | --- |
| `VITE_API_BASE_URL` | 실제 API origin. 예: `https://api.myith.store` |
| `VITE_GOOGLE_CLIENT_ID` | Google Identity Services 웹 클라이언트 ID |
| `VITE_USE_API_MOCKS` | `true`면 브라우저 내부 계약형 목 API 사용 |

access token은 메모리에만 저장하고 refresh token은 탭 수명과 같은 `sessionStorage`에
저장한다. 401이 동시에 발생하면 refresh 요청 하나만 실행하며, 원 요청은 한 번만
재시도한다.

## Swagger 호환 처리

백엔드 `CreateRoadmapRequest`는 프로젝트 경험을 한 묶음만 받을 수 있다.

```json
{
  "narrative": {
    "experience": "1. 첫 번째 프로젝트\n\n2. 두 번째 프로젝트"
  },
  "repoUrl": "https://github.com/example/project",
  "fileKey": "portfolio/user/file.pdf"
}
```

현재 프론트는 여러 카드의 서술을 번호가 있는 문자열 하나로 합치고, 첫 번째 URL과
첫 번째 PDF만 전송한다. 추가 URL/PDF는 백엔드 요청 형식에 필드가 없어 전송할 수 없다.

`Idempotency-Key`는 Swagger에서 optional이다. 배포 서버 CORS가 이 헤더를 허용하지
않으므로 현재 프론트는 로드맵 생성과 퀘스트 완료 요청에 이 헤더를 보내지 않는다.

## 브라우저 통신 조건

- 프론트 origin에 대한 CORS 허용
- 허용 헤더: `Authorization`, `Content-Type`
- 노출 헤더: `Content-Disposition`
- 사용 method: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
- Presigned S3 URL은 브라우저의 `application/pdf` PUT 허용
- 진행률 endpoint는 Bearer 인증이 필요하므로 `EventSource`가 아닌 fetch 기반 SSE 사용

## 백엔드 수정 요청

1. `CreateRoadmapRequest`가 프로젝트 경험 여러 개와 카드별 URL/PDF를 보존해야 한다면
   `experiences[]` 배열 계약을 추가한다.
2. 25개 endpoint의 성공·오류 응답에 OpenAPI `schema`를 연결한다. 현재 example만 있어
   응답 TypeScript 타입을 Swagger에서 직접 생성할 수 없다.
3. `GET /api/ai-enhancements/{requestId}`에 `PROCESSING`, `COMPLETED`, `FAILED` 세 상태의
   응답 schema와 예시를 모두 제공한다. 현재 문서에는 FAILED 예시만 있다.
4. Swagger `servers`의 운영 URL을 `https://api.myith.store`로 수정한다.
5. Google ID Token 검증 실패는 문서대로 `401 INVALID_ID_TOKEN`으로 반환한다. 현재
   잘못된 토큰 일부는 `500 INTERNAL_ERROR`로 변환된다.
6. 인증 필터의 오류도 `{ "error": { "code", "message", "requestId" } }` 형식과
   `401` 상태로 통일한다. 현재 유효하지 않은 Bearer token은 빈 `403` 응답이 될 수 있다.
7. 멱등성 키를 다시 사용할 계획이라면 CORS `Access-Control-Allow-Headers`에
   `Idempotency-Key`를 추가한다.

## 실제 백엔드 전환 체크

1. `.env.local`에 실제 URL과 Google Client ID를 설정하고 목 모드를 끈다.
2. Google 신규 사용자는 온보딩, 기존 사용자는 허브로 이동하는지 확인한다.
3. PDF Presigned URL 발급과 S3 PUT을 확인한다.
4. 동기 생성과 `202 ANALYZING` 생성의 fetch SSE를 확인한다.
5. STAR 임시 저장, AI 결과 적용, 완료 토글을 확인한다.
6. MD/PDF 응답의 `Content-Disposition` 파일명이 브라우저 다운로드에 반영되는지 확인한다.
