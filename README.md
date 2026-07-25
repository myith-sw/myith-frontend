# MYITH Frontend

Vite + React + TypeScript + Tailwind CSS 기반의 캐릭터 에셋 프로젝트입니다.

## Documentation

- [백엔드 연동 및 API 명세](docs/BACKEND_API_SPEC.md)
- [현재 API 연동 가이드](docs/API_INTEGRATION.md)

## Assets

- Figma 노드 `13:408`에서 실제 export한 22종 × 4단계, 총 88개의 75×75 투명 PNG
- `src/assets/characters/`에 보관
- `CharacterSprite`는 로컬 정적 import만 사용하므로 Figma 임시 URL이나 외부 이미지 요청이 없습니다.

## Run

```bash
npm install
npm run api:types
npm run dev
```

기본 개발 모드는 저장소에 포함된 계약형 목 API를 사용합니다. 실제 백엔드로 전환할 때는
`.env.api.example`을 `.env.local`로 복사하고 `VITE_USE_API_MOCKS=false`,
`VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`를 설정합니다.

## Validate

```bash
npm run build
npm run lint
npm test
```
