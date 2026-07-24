# MYITH Frontend

Vite + React + TypeScript + Tailwind CSS 기반의 캐릭터 에셋 프로젝트입니다.

## Documentation

- [백엔드 연동 및 API 명세](docs/BACKEND_API_SPEC.md)

## Assets

- Figma 노드 `13:408`에서 실제 export한 22종 × 4단계, 총 88개의 75×75 투명 PNG
- `src/assets/characters/`에 보관
- `CharacterSprite`는 로컬 정적 import만 사용하므로 Figma 임시 URL이나 외부 이미지 요청이 없습니다.

## Run

```bash
npm install
npm run dev
```

## Validate

```bash
npm run build
```
