# server/AGENTS.md

## Module Context

Bun 런타임의 AI API 프록시 서버. 프론트엔드(`src/`)와 별도 의존성 파일은 없으나 런타임(Bun, `Bun.serve`)과 목적이 다르다.

## Tech Stack & Constraints

- 외부 SDK 없이 `fetch`로 Anthropic/Gemini REST API를 직접 호출한다. SDK나 axios를 추가하지 마라.
- 응답은 `Response.json(..., { headers: CORS_HEADERS })` 형태로 항상 CORS 헤더를 포함한다 (`index.ts:51-55`, 모든 분기에 적용). 새 응답 분기에서 헤더를 누락하지 마라.

## Implementation Patterns

- 모델 폴백은 `withModelFallback`(`fallback.ts`)으로 처리하고, 모델 우선순위는 `GOOGLE_MODELS` 배열 순서(`index.ts:5`)다.
- 순수 로직은 별도 모듈로 분리하고 `*.test.ts`를 같은 폴더에 둔다 (vitest include: `server/**/*.test.ts`).

## Testing Strategy

- `bun run test server/` 로 실행.
- 테스트 있음: `generator.ts`, `fallback.ts`. 테스트 없음: `index.ts` (`Bun.serve` 시작과 외부 API 호출 포함). `index.ts`에 로직을 추가하기보다 테스트 가능한 모듈로 분리하라.

## Local Golden Rules

- 에러 상태 매핑은 메시지 문자열 `includes('503')`, `includes('429')`에 의존한다 (`index.ts:194`, `:201`). 각 호출 함수의 에러 메시지가 `API error: ${status}` 형식으로 상태 코드를 포함해야 매핑이 동작한다 (`index.ts:85`, `:112`). 이 형식을 바꾸면 503/429 안내가 깨진다.
- 프로바이더 간 비대칭: 모델 폴백(`index.ts:134-136`)과 `MAX_TOKENS` 잘림 검사(`index.ts:123-125`)는 Google 경로에만 있고 Anthropic 경로(`index.ts:68-96`)에는 없다. 한쪽만 수정하면 동작이 어긋나므로 의도를 확인하고 변경하라.
- 이중 방어: 시스템 프롬프트가 "코드펜스 금지"와 `render()` 호출을 요구하는데(`index.ts:16`, `:12`), 서버도 `stripCodeFences`와 `ensureRenderCall`로 후처리한다 (`index.ts:188`). 둘 중 하나만 제거하면 모델 응답 편차로 미리보기가 깨진다.
- `withModelFallback`은 마지막 에러만 던진다 (`fallback.ts:15-20`). 앞 모델의 에러(예: 429)는 사라지므로 상태 코드 매핑은 마지막 모델 기준임을 고려하라.
