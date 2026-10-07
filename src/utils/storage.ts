export const STORAGE_KEYS = {
  apiKeys: 'rcg:apiKeys',
  provider: 'rcg:provider',
  promptHistory: 'rcg:promptHistory',
  components: 'rcg:components',
} as const;

/** localStorage에서 JSON 값을 읽는다. 값이 없거나 깨져 있거나 접근 불가면 fallback을 반환한다. */
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** localStorage에 JSON으로 저장한다. 용량 초과 등 실패해도 앱 동작을 막지 않는다. */
export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 무시한다 (비공개 모드, 용량 초과 등)
  }
}
