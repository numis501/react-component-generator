# AGENTS.md

## Operational Commands

- 패키지 매니저는 `bun` 고정. npm/yarn/pnpm 사용 금지 (`bun.lock` 존재, 서버가 `Bun.serve` 사용).
- 설치: `bun install`
- 개발 (API 3002 + Vite 5173 동시): `bun run dev`
- 테스트: `bun run test` (vitest). `bun test`는 Bun 내장 러너를 호출하므로 사용 금지 (jsdom 설정은 `vite.config.ts`의 `test` 블록).
- 단일 테스트: `bun run test server/generator.test.ts`
- 린트: `bun run lint`
- 빌드 및 타입 검사: `bun run build` (`tsc -b && vite build`)
- 변경 완료 전 `bun run lint`, `bun run test`, `bun run build` 순서로 통과 확인.

## Golden Rules

### Immutable

- API 키를 코드/로그/응답에 노출하지 않는다. `/api/config`는 키 존재 여부(boolean)만 반환한다 (`server/index.ts:148-153`). 키 값을 응답에 포함하지 마라.
- Google 호출 URL에 API 키가 쿼리스트링으로 포함된다 (`server/index.ts:99`). 이 URL이나 `fetch` 에러 객체를 로그/에러 메시지로 출력하지 마라.
- `.env`는 커밋하지 않는다 (`.gitignore`).

### Do's & Don'ts

- Do: 생성 코드 정규화 로직은 `server/generator.ts`의 순수 함수로 추가하고 `server/generator.test.ts`에 테스트를 함께 작성한다. 이 파일은 `Bun.serve` 부수효과가 없어서 분리된 것이다 (`server/generator.ts:1-2`).
- Do: 미리보기 코드는 `react-live` `noInline` 모드로 실행된다 (`src/components/LivePreview.tsx:74`). 이 모드는 `render(...)` 호출이 없으면 아무것도 그리지 않는다 (`server/generator.ts:254-257`). 생성 코드 파이프라인을 바꿀 때 `render()` 보장을 유지하라.
- Do: 프론트엔드는 상대 경로 `/api/*`만 호출한다. 포트 3002는 `server/index.ts:139`와 `vite.config.ts` 프록시 두 곳에 있으므로 변경 시 함께 수정하라.
- Don't: 컴포넌트 생성 시스템 프롬프트(`server/index.ts:7-49`)에서 "import 금지", "TypeScript 문법 금지" 규칙을 제거하지 마라. react-live 런타임은 import와 TS 타입 문법을 처리하지 못한다 (`server/index.ts:12`, `:20`).
- Don't: `Provider` 타입은 프론트(`src/types/index.ts`)와 서버(`server/index.ts:57`)에 각각 정의되어 있다. 프로바이더 추가 시 두 곳과 `ENV_KEYS`, UI 선택지를 함께 수정하라.

## Project Context

- 프롬프트로 React 컴포넌트를 생성하고 실시간 미리보기와 코드를 보여주는 도구.
- Stack: React 19, TypeScript, Vite, Bun, react-live, Vitest, Testing Library, ESLint.
- 설치/실행/기능 설명은 `README.md` 참조.

## Standards & References

- 커밋: 한국어 Conventional Commits 형식 `type: 설명` (예: `feat: ...`, `chore: ...`). 변경은 논리적 단위로 분리.
- 서버 영역 규칙은 `server/AGENTS.md` 참조.
- Maintenance Policy: 이 문서의 규칙과 코드 사이에 괴리가 발견되면 작업을 마치기 전에 AGENTS.md 업데이트를 제안하라.
